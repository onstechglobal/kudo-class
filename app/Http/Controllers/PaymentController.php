<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Razorpay\Api\Api;
use Illuminate\Support\Facades\DB;
use App\Models\PaymentModel;

class PaymentController extends Controller
{
    protected $paymentModel;

    public function __construct()
    {
        $this->paymentModel = new PaymentModel();
    }

    /*
    |------------------------------------------------------------------
    | 🔐 Authorization
    |------------------------------------------------------------------
    */
    private function authorizeStudentAccess($userId, $studentId)
    {
        $user = DB::table('tb_users')
            ->where('user_id', $userId)
            ->where('status', 'active')
            ->first();

        if (!$user) return false;

        if (in_array($user->role_id, [1,2])) {
            return DB::table('tb_students')
                ->where('student_id', $studentId)
                ->where('school_id', $user->school_id)
                ->exists();
        }

        if ($user->role_id == 4) {
            return DB::table('tb_students as s')
                ->join('tb_parents as p', 's.family_id', '=', 'p.family_id')
                ->where('s.student_id', $studentId)
                ->where('p.user_id', $userId)
                ->where('s.school_id', $user->school_id)
                ->exists();
        }

        return false;
    }

    /*
    |------------------------------------------------------------------
    | Get Student Fees + History
    |------------------------------------------------------------------
    */
    public function getStudentData(Request $request, $studentId)
    {
        if (!$this->authorizeStudentAccess($request->user_id, $studentId)) {
            return response()->json(['error'=>'Unauthorized'], 403);
        }

        $fees = $this->paymentModel->getPendingFees($studentId);
        $history = $this->paymentModel->getPaymentHistory($studentId);

        return response()->json([
            'fees'    => $fees,
            'history' => $history
        ]);
    }

    /*
    |------------------------------------------------------------------
    | Create Razorpay Order
    |------------------------------------------------------------------
    */
    public function createOrder(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'student_id' => 'required'
        ]);

        if (!$this->authorizeStudentAccess($request->user_id, $request->student_id)) {
            return response()->json(['error'=>'Unauthorized'], 403);
        }

        $api = new Api(config('services.razorpay.key'), config('services.razorpay.secret'));

        $order = $api->order->create([
            'receipt'  => uniqid(),
            'amount'   => $request->amount * 100,
            'currency' => 'INR',
        ]);

        return response()->json([
            'order_id' => $order['id'],
            'amount'   => $order['amount'],
            'key'      => config('services.razorpay.key'),
        ]);
    }

    /*
    |------------------------------------------------------------------
    | Verify Razorpay Payment & Insert Payment Items
    |------------------------------------------------------------------
    */
    public function verifyPayment(Request $request){
        DB::beginTransaction();

        try {

            // ✅ Check user access
            if (!$this->authorizeStudentAccess($request->user_id, $request->student_id)) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            // ✅ Verify Razorpay Signature
            $api = new Api(
                config('services.razorpay.key'),
                config('services.razorpay.secret')
            );

            $api->utility->verifyPaymentSignature([
                'razorpay_order_id'   => $request->razorpay_order_id,
                'razorpay_payment_id' => $request->razorpay_payment_id,
                'razorpay_signature'  => $request->razorpay_signature,
            ]);

            // ✅ Get payment type (default = both)
            $paymentType = $request->payment_type ?? 'both';

            $originalAmount = (float) $request->original_amount;
            $remainingAmount = $originalAmount;

            // ✅ Get all pending fees (ordered oldest first recommended)
            $pendingFees = $this->paymentModel->getPendingFees($request->student_id);

            $studentFeeIds = [];
            $amounts = [];

            foreach ($pendingFees as $fee) {

                if ($remainingAmount <= 0) break;

                $remaining = $fee->net_amount - $fee->paid_amount;

                if ($remaining <= 0) continue;

                /*
                |--------------------------------------------------------------------------
                | MONTHLY FEES (academic / transport)
                |--------------------------------------------------------------------------
                */
                if (in_array($fee->fee_type, ['academic', 'transport'])) {
                    $monthlyAmount = round($fee->net_amount / 12, 2);

                    if ($paymentType === 'current') {
                        // ✅ Pay only ONE month, even if partial
                        $due = min($monthlyAmount, $remaining);
                    } else {
                        // ✅ Pay all pending months
                        $due = $remaining;
                    }
                } else {
                    // One-time fees
                    $due = $remaining;
                }

                $payAmount = min($due, $remainingAmount);

                if ($payAmount <= 0) continue;

                // ✅ Store for payment_items table
                $studentFeeIds[] = $fee->id;
                $amounts[] = $payAmount;

                // ✅ Update paid_amount in student_fees
                $this->paymentModel->updateStudentFee($fee->id, $payAmount);

                $remainingAmount -= $payAmount;
            }

            /*
            |--------------------------------------------------------------------------
            | Insert Payment Record
            |--------------------------------------------------------------------------
            */
            if (!empty($studentFeeIds)) {

                $this->paymentModel->insertPaymentWithItems(
                    $studentFeeIds,
                    $amounts,
                    $request->razorpay_payment_id,
                    $request->student_id,
                    $request->user_id
                );
            }

            DB::commit();

            return response()->json([
                'status' => 'success'
            ]);

        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'status'  => 'failed',
                'message' => $e->getMessage()
            ], 400);
        }
    }


}

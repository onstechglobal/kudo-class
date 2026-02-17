<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;

class PaymentModel
{
    protected $studentFeesTable = 'tb_student_fees';
    protected $paymentsTable    = 'tb_payments';
    protected $paymentItemsTable = 'tb_payment_items';

    /*
    |------------------------------------------------------------------
    | Get Pending Fees of Student
    |------------------------------------------------------------------
    
    /*
    public function getPendingFees($studentId){
        return DB::table($this->studentFeesTable . ' as sf')
            ->leftJoin('tb_fee_structures as fs', 'sf.fee_id', '=', 'fs.fee_id')
            ->leftJoin('tb_students as s', 'sf.student_id', '=', 's.student_id')
            ->leftJoin('tb_transport_routes as tr', 's.route_id', '=', 'tr.route_id')
            ->where('sf.student_id', $studentId)
            ->whereIn('sf.status', ['pending', 'partial'])
            ->select(
                'sf.id',
                'sf.fee_id',
                'sf.fee_type',
                'sf.base_amount',
                'sf.discount',
                'sf.net_amount',
                'sf.paid_amount',
                'sf.status',
                DB::raw("
                    CASE
                        WHEN sf.fee_id IS NOT NULL THEN fs.fee_name
                        WHEN sf.fee_id IS NULL AND sf.fee_type = 'transport' THEN tr.route_name
                        ELSE 'N/A'
                    END as fee_name
                ")
            )
            ->orderBy('sf.id')
            ->get();
    }
    */

    public function getPendingFees($studentId){
        return DB::table($this->studentFeesTable . ' as sf')
            ->leftJoin('tb_fee_structures as fs', 'sf.fee_id', '=', 'fs.fee_id')
            ->leftJoin('tb_students as s', 'sf.student_id', '=', 's.student_id')
            ->leftJoin('tb_transport_routes as tr', 's.route_id', '=', 'tr.route_id')
            ->where('sf.student_id', $studentId)
            ->whereIn('sf.status', ['pending', 'partial'])
            ->select(
                'sf.id',
                'sf.fee_id',
                'sf.fee_type',
                'sf.base_amount',
                'sf.discount',
                'sf.net_amount',
                'sf.paid_amount',
                'sf.status',

                DB::raw("
                    CASE
                        WHEN sf.fee_id IS NOT NULL THEN fs.fee_name
                        WHEN sf.fee_id IS NULL AND sf.fee_type = 'transport' THEN tr.route_name
                        ELSE 'N/A'
                    END as fee_name
                "),
                DB::raw("
                    CASE
                        WHEN sf.fee_type IN ('academic','transport')
                        THEN ROUND((sf.net_amount - sf.paid_amount),2)
                        ELSE (sf.net_amount - sf.paid_amount)
                    END as total_due
                "),
                DB::raw("
                    CASE
                        WHEN sf.fee_type IN ('academic','transport')
                        THEN ROUND((sf.net_amount / 12),2)
                        ELSE 0
                    END as monthly_amount
                ")
            )

            ->orderBy('sf.id')
            ->get();
    }

    /*
    |------------------------------------------------------------------
    | Update Student Fee After Payment
    |------------------------------------------------------------------
    */
    public function updateStudentFee($studentFeeId, $amount)
    {
        $fee = DB::table($this->studentFeesTable)
            ->where('id', $studentFeeId)
            ->first();

        if (!$fee) {
            return false;
        }

        $newPaidAmount = $fee->paid_amount + $amount;

        $status = 'partial';
        if ($newPaidAmount >= $fee->net_amount) {
            $status = 'paid';
        }

        return DB::table($this->studentFeesTable)
            ->where('id', $studentFeeId)
            ->update([
                'paid_amount' => $newPaidAmount,
                'status'      => $status,
            ]);
    }

    /*
    |------------------------------------------------------------------
    | Insert Payment with Multiple Fee Items
    |------------------------------------------------------------------
    */
    public function insertPaymentWithItems($studentFeeIds,$amounts,$transactionId,$studentId,$userId){
        if (empty($studentFeeIds) || empty($amounts)) {
            return false;
        }

        $schoolId = DB::table('tb_students')
            ->where('student_id', $studentId)
            ->value('school_id');

        $paymentId = DB::table($this->paymentsTable)->insertGetId([
            'school_id'      => $schoolId,
            'amount_paid'    => array_sum($amounts),
            'payment_mode'   => 'upi',
            'payment_status' => 'success',
            'payment_date'   => now()->toDateString(),
            'transaction_id' => $transactionId,
            'receipt_url'    => null,
            'created_at'     => now(),
        ]);

        foreach ($studentFeeIds as $i => $feeId) {
            DB::table($this->paymentItemsTable)->insert([
                'payment_id'     => $paymentId,
                'student_fee_id' => $feeId,
                'amount'         => $amounts[$i],
                'created_at'     => now(),
            ]);
        }

        return $paymentId;
    }


    /*
    |------------------------------------------------------------------
    | Get Payment History
    |------------------------------------------------------------------
    */
    public function getPaymentHistory($studentId){
        return DB::table($this->paymentsTable . ' as p')
            ->join($this->paymentItemsTable . ' as pi', 'p.payment_id', '=', 'pi.payment_id')
            ->join($this->studentFeesTable . ' as sf', 'pi.student_fee_id', '=', 'sf.id')
            ->join('tb_students as s', 'sf.student_id', '=', 's.student_id')
            ->leftJoin('tb_classes as c', 's.class_id', '=', 'c.class_id')
            ->where('sf.student_id', $studentId)
            ->groupBy(
                'p.payment_id',
                'p.transaction_id',
                'p.payment_date',
                'p.amount_paid',
                'p.payment_mode',
                'p.payment_status',
                'p.receipt_url',
                's.first_name',
                's.last_name',
                's.admission_no',
                'c.class_name'
            )
            ->select(
                'p.payment_id',
                'p.transaction_id',
                'p.payment_date',
                'p.amount_paid',
                'p.payment_mode',
                'p.payment_status as status',
                'p.receipt_url',
                's.first_name',
                's.last_name',
                's.admission_no',
                'c.class_name as class',
                DB::raw('GROUP_CONCAT(pi.amount) as paid_items')
            )
            ->orderByDesc('p.payment_id')
            ->get();
    }


}

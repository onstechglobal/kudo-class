<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    public function download($id)
    {
        // Get main payment record
        $payment = DB::table('tb_payments')
            ->where('payment_id', $id)
            ->first();

        if (!$payment) {
            abort(404, 'Payment not found');
        }

        // Get payment items
        $items = DB::table('tb_payment_items as pi')
            ->join('tb_student_fees as sf', 'pi.student_fee_id', '=', 'sf.id')
            ->leftJoin('tb_fee_structures as fs', 'sf.fee_id', '=', 'fs.fee_id')
            ->select(
                'pi.amount',
                'sf.fee_type',
                'fs.fee_name'
            )
            ->where('pi.payment_id', $id)
            ->get();

        $pdf = Pdf::loadView('pdf.invoice', [
            'payment' => $payment,
            'items'   => $items
        ]);

        return $pdf->download('Invoice-'.$payment->payment_id.'.pdf');
    }
}

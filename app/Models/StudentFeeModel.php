<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class StudentFeeModel extends Model
{
    protected $table = 'tb_student_fees';
    public $timestamps = false;

    public static function getAllStudentFees($schoolId, $userId = null, $role = null){
        $query = DB::table('tb_students as s')
            ->leftJoin('tb_student_fees as sf', 's.student_id', '=', 'sf.student_id')
            ->leftJoin('tb_classes as c', 's.class_id', '=', 'c.class_id')
            ->leftJoin('tb_sections as sec', 's.section_id', '=', 'sec.section_id')
            ->select(
                's.student_id',
                DB::raw("CONCAT(s.first_name, ' ', s.last_name) as student_name"),
                's.admission_no',
                'c.class_name',
                'sec.section_name',

                DB::raw('SUM(CAST(IFNULL(sf.net_amount,0) AS DECIMAL(10,2))) as total_net'),

                DB::raw('SUM(CAST(IFNULL(sf.paid_amount,0) AS DECIMAL(10,2))) as total_paid'),

                DB::raw('SUM(CAST(IFNULL(sf.penalty_amount,0) AS DECIMAL(10,2))) as total_penalty'),

                // balance
                DB::raw('
                    SUM(
                        CAST(IFNULL(sf.net_amount,0) AS DECIMAL(10,2)) +
                        CAST(IFNULL(sf.penalty_amount,0) AS DECIMAL(10,2)) -
                        CAST(IFNULL(sf.paid_amount,0) AS DECIMAL(10,2))
                    ) as total_balance
                '),
            )
            ->where('s.status', 'active')
            ->groupBy(
                's.student_id',
                's.first_name',
                's.last_name',
                's.admission_no',
                'c.class_name',
                'sec.section_name'
            );

        if ($role === 'admin') {
            $query->where('s.school_id', $schoolId);
        }

        if ($role === 'parent') {
            $query->where('s.parent_user_id', $userId);
        }

        return $query->orderBy('s.student_id', 'desc')->get();
    }

    public static function getStudentFeeDetails($studentId){
        return DB::table('tb_student_fees as sf')
            ->select(
                'sf.id',
                'sf.fee_type',

                DB::raw('CAST(IFNULL(sf.net_amount,0) AS DECIMAL(10,2)) as net_amount'),
                DB::raw('CAST(IFNULL(sf.paid_amount,0) AS DECIMAL(10,2)) as paid_amount'),
                DB::raw('CAST(IFNULL(sf.penalty_amount,0) AS DECIMAL(10,2)) as penalty_amount'),

                DB::raw('
                    (
                        CAST(IFNULL(sf.net_amount,0) AS DECIMAL(10,2)) +
                        CAST(IFNULL(sf.penalty_amount,0) AS DECIMAL(10,2)) -
                        CAST(IFNULL(sf.paid_amount,0) AS DECIMAL(10,2))
                    ) as balance
                '),

                'sf.status',
                'sf.contract_start_date',
                'sf.contract_end_date',
                'sf.due_day',
                'sf.created_at'
            )
            ->where('sf.student_id', $studentId)
            ->orderBy('sf.created_at', 'desc')
            ->get();
    }





}

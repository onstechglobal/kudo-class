<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class StudentFeeModel extends Model
{
    protected $table = 'tb_student_fees';
    public $timestamps = false;

    public static function getAllStudentFees($schoolId, $userId = null, $role = null){
        $query = DB::table('tb_student_fees as sf')
            ->join('tb_students as s', 'sf.student_id', '=', 's.student_id')
            ->leftJoin('tb_classes as c', 's.class_id', '=', 'c.class_id')
            ->leftJoin('tb_sections as sec', 's.section_id', '=', 'sec.section_id')
            ->select(
                'sf.id',
                'sf.student_id',
                'sf.fee_type',
                'sf.base_amount',
                'sf.discount',
                'sf.net_amount',
                'sf.paid_amount',
                DB::raw('(sf.net_amount - sf.paid_amount) as balance'),
                'sf.status',
                'sf.is_blocked',
                'sf.block_reason',
                'sf.created_at',
                's.admission_no',
                DB::raw("CONCAT(s.first_name, ' ', s.last_name) as student_name"),
                'c.class_name',
                'sec.section_name'
            )
            ->where('s.status', 'active');

        // ✅ If Admin → show all school students
        if ($role === 'admin') {
            $query->where('s.school_id', $schoolId);
        }

        // ✅ If Parent → show only own child
        if ($role === 'parent') {
            $query->where('s.parent_user_id', $userId);
        }

        return $query->orderBy('sf.created_at', 'desc')->get();
    }

}

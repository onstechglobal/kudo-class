<?php
namespace App\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TeacherModel{
    protected string $table = 'tb_teachers';

    public function create(array $data, int $userId)
    {
        return DB::table($this->table)->insert([
            'school_id'     => $data['school_id'] ?? 1,
            'user_id'       => $userId,
            'employee_code' => $data['employee_code'] ?? null,
            'first_name'    => $data['first_name'],
            'last_name'     => $data['last_name'] ?? null,
            'email'         => $data['email'],
            'mobile'        => $data['mobile'] ?? null,
            'designation'   => $data['designation'] ?? null,
            'joining_date'  => $data['joining_date'] ?? null,
            'qualification' => $data['qualification'] ?? null,
            'experience_years' => $data['experience_years'] ?? null,
            'photo_url'     => $data['photo'] ?? null,   // Image path relative to uploads folder
            'status'        => $data['status'] ?? 'active',
            'created_at'    => now(),
        ]);
    }

    public function getAllTeachers(){
        return DB::table('tb_teachers as t')
            ->join('tb_users as u', 'u.user_id', '=', 't.user_id')
            ->select(
                't.teacher_id',
                't.employee_code',
                't.first_name',
                't.last_name',
                't.designation',
                't.joining_date',
                't.status',
                't.email',
                't.photo_url',
                'u.mobile'
            )
            ->orderBy('t.teacher_id', 'desc')
            ->get();
    }
}
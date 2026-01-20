<?php
namespace App\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StaffModel{
    protected string $table = 'tb_staff';

    public function create(array $data, int $userId){
        return DB::table($this->table)->insert([
            'school_id' => $data['school_id'] ?? 1,
            'user_id'   => $userId,
            'name'      => $data['name'],
            'role'      => $data['staff_role'] ?? 'Staff',
            'email'     => $data['email'],
            'mobile'    => $data['mobile'] ?? null,
            'status'    => $data['status'] ?? 'active',
            'created_at'=> now(),
        ]);
    }
}

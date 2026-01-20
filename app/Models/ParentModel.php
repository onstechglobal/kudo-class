<?php
namespace App\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ParentModel{
    protected string $table = 'tb_parents';

    public function create(array $data, int $userId){
        return DB::table($this->table)->insert([
            'school_id'  => $data['school_id'] ?? 1,
            'user_id'    => $userId,
            'first_name' => $data['first_name'] ?? $data['name'],
            'last_name'  => $data['last_name'] ?? null,
            'email'      => $data['email'],
            'mobile'     => $data['mobile'] ?? null,
            'status'     => $data['status'] ?? 'active',
            'created_at' => now(),
        ]);
    }
}

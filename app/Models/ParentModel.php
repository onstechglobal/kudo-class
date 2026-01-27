<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;

class ParentModel
{
    protected string $table = 'tb_parents';

    /**
     * Create parent record
     */
    public function create(array $data, int $userId)
    {
        return DB::table($this->table)->insert([
            'school_id'         => $data['school_id'] ?? 1,
            'user_id'           => $userId,
            'first_name'        => $data['first_name'],
            'last_name'         => $data['last_name'] ?? null,
            'email'             => $data['email'],
            'mobile'            => $data['mobile'],
            'alternate_mobile'  => $data['alternate_mobile'] ?? null,
            'password_hash'     => null,
            'status'            => $data['status'] ?? 'active',
            'created_at'        => now(),
        ]);
    }

    /**
     * Parent listing (JOIN WITH USERS – SAME AS TEACHER)
     */
    public function getAllParents()
    {
        return DB::table('tb_parents as p')
            ->join('tb_users as u', 'u.user_id', '=', 'p.user_id')
            ->select(
                'p.parent_id',
                'p.first_name',
                'p.last_name',
                'p.email',
                'p.mobile',
                'p.alternate_mobile',
                'p.status',
                'u.username',
                'u.role_id'
            )
            ->orderBy('p.parent_id', 'desc')
            ->get();
    }
}

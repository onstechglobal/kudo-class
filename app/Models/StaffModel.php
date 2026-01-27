<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;

class StaffModel
{
    protected string $table = 'tb_staff';

    /**
     * Insert new staff record
     */
    public function insertStaff($data, $logoName) {
        return DB::table($this->table)->insertGetId([
            'staff_id'      => null,
            'school_id'     => $data['school_id'],
            'name'          => $data['name'],
            'role'          => $data['role'],
            'email'         => $data['email'],
            'mobile'        => $data['mobile'],
            'password_hash' => $data['password_hash'],
            'photo_url'     => $logoName,
            'status'        => $data['status'] ?? 'active',
            'created_at'    => now()
        ]);
    }


    /**
     * Get staff list with optional filters
     */
	public function getStaffList($perPage = 10, $filters = []) {
        $query = DB::table($this->table)
            // Left join ensures we see staff even if school_id is missing/invalid
            ->leftJoin('tb_schools', 'tb_staff.school_id', '=', 'tb_schools.school_id')
            ->select(
                'tb_staff.*', 
                'tb_schools.school_name'
            );

        // 1. Search filter (Name, Email, or Mobile)
        if (!empty($filters['search'])) {
            $query->where(function($q) use ($filters) {
                $q->where('tb_staff.name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('tb_staff.email', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('tb_staff.mobile', 'like', '%' . $filters['search'] . '%');
            });
        }

        // 2. Role filter
        if (!empty($filters['role'])) {
            $query->where('tb_staff.role', $filters['role']);
        }

        // 3. Email filter
        if (!empty($filters['email'])) {
            $query->where('tb_staff.email', 'like', '%' . $filters['email'] . '%');
        }

        // 4. Mobile filter
        if (!empty($filters['mobile'])) {
            $query->where('tb_staff.mobile', $filters['mobile']);
        }

        // 5. Sort by latest
        $query->orderBy('tb_staff.created_at', 'desc');

        return $query->paginate($perPage);
    }
	
	
	public function getStaffById($id) {
        return DB::table($this->table)
            ->where('staff_id', $id)
            ->first();
    }

    public function updateStaff($id, $data) {
        return DB::table($this->table)
            ->where('staff_id', $id)
            ->update($data);
    }
	
	
	/**
     * Delete staff record
     */
    public function deleteStaff($id) {
        return DB::table($this->table)->where('staff_id', $id)->delete();
    }
	
	
	
}
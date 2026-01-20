<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SchoolModel
{
    protected string $table = 'tb_schools';

    /* =======================
       GET ALL USERS
    ======================= */
    // public function getAllUsers()
    public function getSchoolData(){
        return DB::table($this->table)
			->select('*')
            ->get();
    }
	
	public function getSchoolList1($perpage=5){
		return DB::table($this->table)->paginate($perpage);
	}
	
	public function getSchoolList($perpage = 5, $filters = []) {
		return DB::table($this->table)
			->when(!empty($filters['search']), function ($query) use ($filters) {
				$query->where(function($q) use ($filters) {
					$q->where('school_name', 'like', '%' . $filters['search'] . '%')
					  ->orWhere('school_code', 'like', '%' . $filters['search'] . '%')
					  ->orWhere('email', 'like', '%' . $filters['search'] . '%');
				});
			})
			->when(!empty($filters['board']), function ($query) use ($filters) {
				$query->where('board', $filters['board']);
			})
			->when(!empty($filters['status']), function ($query) use ($filters) {
				$query->where('status', $filters['status']);
			})
			->orderBy('school_id', 'desc') // Optional: show newest schools first
			->paginate($perpage);
	}
	

	public function getSchoolStats(){
		return [
			'total' => DB::table($this->table)->count(),

			'active' => DB::table($this->table)
				->where('status', 'active')
				->count(),

			'inactive' => DB::table($this->table)
				->where('status', 'inactive')
				->count(),
		];
	}
	
	
	/* ====== INSERT NEW SCHOOL ========= */
	public function insertSchool($data) {
		// 1. Generate School Code
		$prefix = 'SCH-';
		$cleanName = str_replace(' ', '', $data['school_name']);
		$namePart = strtoupper(substr($cleanName, 0, 2));
		$phonePart = substr($data['phone'], -3);
		$generatedCode = $prefix.$namePart.$phonePart ;
		
		// 2. Insert with data casting
		return DB::table($this->table)->insert([
			'school_id'            => null,
			'school_code'          => $generatedCode,
			'school_name'          => $data['school_name'],
			'email'                => $data['email'],
			'phone'                => $data['phone'],
			'alternate_phone'      => $data['alternate_phone'] ?? null,
			'address_line1'        => $data['address_line1'],
			'address_line2'        => $data['address_line2'] ?? null,
			'city'                 => $data['city'],
			'state'                => $data['state'],
			'country'              => $data['country'] ?? 'India',
			'pincode'              => $data['pincode'],
			'board'                => $data['board'],
			'logo_url'             => $data['logo_url'] ?? null,
			'academic_start_month' => (int)$data['academic_start_month'],
			'status'               => $data['status'],
			'created_at'           => now(),
			'updated_at'           => now(),
		]);
	}
	
	
	public function getSchoolById($id) {
		return DB::table($this->table)->where('school_id', $id)->first();
	}

	public function updateSchool($id, $data) {
		$updateData = [
			'school_name'           => $data['school_name'],
			'email'                 => $data['email'],
			'phone'                 => $data['phone'],
			'alternate_phone'       => $data['alternate_phone'] ?? null,
			'address_line1'         => $data['address_line1'],
			'address_line2'         => $data['address_line2'] ?? null,
			'city'                  => $data['city'],
			'state'                 => $data['state'],
			'country'              => $data['country'] ?? 'India',
			'pincode'               => $data['pincode'],
			'board'                 => $data['board'],
			'academic_start_month'  => (int)$data['academic_start_month'],
			'status'                => $data['status'],
			'updated_at'            => now(),
		];

		// Only update logo_url if a new one was uploaded
		if (isset($data['logo_url'])) {
			$updateData['logo_url'] = $data['logo_url'];
		}

		return DB::table($this->table)->where('school_id', $id)->update($updateData);
	}
	
	
	public function deleteSchool($id) {
		return DB::table($this->table)->where('school_id', $id)->delete();
	}
	
	
}

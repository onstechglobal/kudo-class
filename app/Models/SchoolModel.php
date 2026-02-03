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
	
	public function getSchoolList1($perpage=8){
		return DB::table($this->table)->paginate($perpage);
	}
	
	public function getSchoolList($perpage = 8, $filters = []) {
		return DB::table($this->table)
			->when(!empty($filters['search']), function ($query) use ($filters) {
				$query->where(function($q) use ($filters) {
					$q->where('school_name', 'like', '%' . $filters['search'] . '%')
					  ->orWhere('school_code', 'like', '%' . $filters['search'] . '%')
					  ->orWhere('school_id', 'like', '%' . $filters['search'] . '%')
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
	
	
	
	/* ====== CHECK FOR DUPLICATES ========= */
	public function checkExistingSchool($email, $phone) {
		return DB::table($this->table)
			->where('email', $email)
			->orWhere('phone', $phone)
			->first();
	}

	/* ====== INSERT NEW SCHOOL (Updated) ========= */
	public function insertSchool($data, $logoName = null) {
		$prefix = 'SCH-';
		$chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		$code = substr(str_shuffle($chars), 0, 4);
		$generatedCode = $prefix . $code;

		return DB::table($this->table)->insertGetId([
			'school_code'          => $generatedCode,
			'school_name'          => $data['school_name'],
			'email'                => $data['email'],
			'phone'                => $data['phone'],
			'alternate_phone'      => $data['alternate_phone'] ?? null,
			'address_line1'        => $data['address_line1'],
			'city'                 => $data['city'],
			'state'                => $data['state'],
			'country'              => $data['country'] ?? 'India',
			'pincode'              => $data['pincode'],
			'board'                => $data['board'],
			'logo_url'             => $logoName, // Can be null now
			'academic_start_month' => (int)$data['academic_start_month'],
			'status'               => $data['status'],
			'created_at'           => now(),
			'updated_at'           => now(),
		]);
	}
	

	/* ====== INSERT NEW SCHOOL As User ========= */
	public function insertUserData($data,$school_id) {
		
		$school_name = preg_replace('/[^a-z0-9]/', '', strtolower($data['school_name']));
		$user_name = 'sch_'.$school_name;
		
		// 2. Insert with data casting
		return DB::table('tb_users')->insert([
			'username'   => $user_name,
            'school_id'  => $school_id,
            'name'       => $data['school_name'] ?? null,
            'email'      => $data['email'] ?? null,
            'mobile'     => $data['phone'] ?? null,
            'password'   => Hash::make($data['password']),
            'role_id'    => "2", // numeric ID
            'status'     => $data['status'],
            'created_at' => now(),
		]);
	}
	
	
	public function getSchoolById($id) {
		return DB::table($this->table)->where('school_id', $id)->first();
	}

	public function updateSchool($id, $data, $logoName) {
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
		if (isset($logoName) && !empty($logoName)) {
			$updateData['logo_url'] = $logoName;
		}if (isset($data['logo_url'])) {
			$updateData['logo_url'] = $data['logo_url'];
		}

		return DB::table($this->table)->where('school_id', $id)->update($updateData);
	}
	
	
	public function deleteSchool($id) {
		return DB::table($this->table)->where('school_id', $id)->delete();
	}
	
	
}

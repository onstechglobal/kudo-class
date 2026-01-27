<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StudentModel
{
    protected string $table = 'tb_students';
	
	
	public function insertStudent($data, $photoName) {
		return DB::table('tb_students')->insertGetId([
			'student_id'         => null,
			'school_id'          =>  12,
			'academic_year_id'   => 2026,
			'admission_no'       => $data['admission_no'],
			'roll_no'            => $data['roll_no'] ?? null,
			'first_name'         => $data['first_name'],
			'last_name'          => $data['last_name'] ?? null,
			'gender'             => $data['gender'],
			'dob'                => $data['dob'],
			'blood_group'        => $data['blood_group'] ?? null,
			'class_id'           => $data['class_id'],
			'section_id'         => $data['section_id'],
			'photo_url'          => $photoName,
			'address'            => $data['address'] ?? null,
			'city'               => $data['city'] ?? null,
			'state'              => $data['state'] ?? null,
			'pincode'            => $data['pincode'] ?? null,
			'emergency_contact'  => $data['emergency_contact'] ?? null,
			'status'             => $data['status'] ?? 'active',
			'joined_date'        => $data['joined_date'] ?? now()->format('Y-m-d'),
			'left_date'          => null,
			'created_at'         => now(),
			'updated_at'         => now(),
		]);
	}
	
	
	
	public function fetchStudents($params) {
		$query = DB::table('tb_students')->select('*');

		// Filter by Search Query
		if (!empty($params['search'])) {
			$search = $params['search'];
			$query->where(function($q) use ($search) {
				$q->where('first_name', 'LIKE', "%$search%")
				  ->orWhere('last_name', 'LIKE', "%$search%")
				  ->orWhere('admission_no', 'LIKE', "%$search%")
				  ->orWhere('city', 'LIKE', "%$search%");
			});
		}

		// Filter by Status
		if (!empty($params['status'])) {
			$query->where('status', $params['status']);
		}

		// Order by newest first and paginate
		return $query->orderBy('student_id', 'desc')->paginate(10);
	}


	public function getStudentStats() {
		return [
			'active'   => DB::table('tb_students')->where('status', 'active')->count(),
			'inactive' => DB::table('tb_students')->where('status', 'inactive')->count()
		];
	}
	
	
	public function getStudentById($id) {
		return DB::table('tb_students')->where('student_id', $id)->first();
	}

	public function updateStudentData($id, $data) {
		return DB::table('tb_students')
			->where('student_id', $id)
			->update($data);
	}
	
	
	
	public function deleteStudent($id) {
		return DB::table($this->table)->where('student_id', $id)->delete();
	}
	
	
}

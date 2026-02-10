<?php
namespace App\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TeacherModel{
    protected string $table = 'tb_teachers';

    // CREATE TEACHER
	public function createTeacherWithUser(array $data, string $username, string $password){
		return DB::transaction(function () use ($data, $username, $password) {
			// 1. Create the User Record
			$userId = DB::table('tb_users')->insertGetId([
				'username'   => $username,
				'name'       => $data['first_name'],
				'email'      => $data['email'],
				'mobile'     => $data['mobile'],
				'password'   => Hash::make($password),
				'role_id'    => 3, // Teacher Role
				'status'     => 'active',
				'created_at' => now()
			]);

			// 2. Create the Teacher Record using the new User ID
			return DB::table($this->table)->insert([
				'school_id'       => $data['school_id'] ?? null,
				'user_id'         => $userId,
				'employee_code'   => $data['employee_code'] ?? null,
				'first_name'      => $data['first_name'],
				'last_name'       => $data['last_name'] ?? null,
				'father_name'     => $data['father_name'] ?? null,
				'mother_name'     => $data['mother_name'] ?? null,
				'email'           => $data['email'],
				'mobile'          => $data['mobile'] ?? null,
				'address'         => $data['address'] ?? null,
				'designation'     => $data['designation'] ?? null,
				'date_of_birth'   => $data['dob'] ?? null,
				'country'         => $data['country'] ?? null,
				'state'           => $data['state'] ?? null,
				'district'        => $data['district'] ?? null,
				'city'            => $data['city'] ?? null,
				'pincode'         => $data['pincode'] ?? null,
				'joining_date'    => $data['joining_date'] ?? null,
				'qualification'   => $data['qualification'] ?? null,
				'experience_years'=> $data['experience_years'] ?? null,
				'photo_url'       => $data['photo'] ?? null,
				'status'          => $data['status'] ?? 'active',
				'created_at'      => now(),
			]);
		});
	}
	

    // GET ALL TEACHERS
    public function getAllTeachers()
	{
		$teachers = DB::table('tb_teachers as t')
			->join('tb_users as u', 'u.user_id', '=', 't.user_id')
			->leftJoin('tb_schools as s', 's.school_id', '=', 't.school_id')
			->select(
				't.*',
				'u.username',
				'u.mobile',
				's.school_name'
			)
			->orderBy('t.teacher_id', 'desc')
			->get();

		$teachers->transform(function($teacher){
			if($teacher->photo_url){
				$teacher->photo_url = url('uploads/'.$teacher->photo_url);
			}
			return $teacher;
		});

		return $teachers;
	}

		
	

    // GET SINGLE TEACHER
    public function getTeacherById(int $id)
    {
        $teacher = DB::table('tb_teachers as t')
            ->join('tb_users as u', 'u.user_id', '=', 't.user_id')
            ->where('t.teacher_id', $id)
            ->select(
                't.*',
                'u.username'
            )
            ->first();

        if($teacher && $teacher->photo_url){
            $teacher->photo_url = url('uploads/'.$teacher->photo_url);
        }

        return $teacher;
    }

    // UPDATE TEACHER
    public function updateTeacher(int $id, array $data)
    {
        $teacher = DB::table($this->table)->where('teacher_id', $id)->first();
        if(!$teacher) return false;

        // PHOTO
        $photoPath = $teacher->photo_url;
        if(!empty($data['teacher_photo'])){
            $photoPath = $data['teacher_photo'];
        }

        // UPDATE USER
        $userUpdate = [
            'username' => $data['username'],
            'email'    => $data['email'],
            'mobile'   => $data['mobile'],
        ];

        if(!empty($data['password'])){
            $userUpdate['password'] = Hash::make($data['password']);
        }

        DB::table('tb_users')
            ->where('user_id', $teacher->user_id)
            ->update($userUpdate);

        // UPDATE TEACHER
        DB::table($this->table)
            ->where('teacher_id', $id)
            ->update([
                'first_name'       => $data['first_name'],
                'last_name'        => $data['last_name'],
                'father_name'      => $data['father_name'] ?? null,
                'mother_name'      => $data['mother_name'] ?? null,
                'email'            => $data['email'],
                'mobile'           => $data['mobile'],
                'address'          => $data['address'] ?? null,
                'country'          => $data['country'] ?? null,
                'state'            => $data['state'] ?? null,
                'district'         => $data['district'] ?? null,
                'city'             => $data['city'] ?? null,
                'pincode'          => $data['pincode'] ?? null,
                'designation'      => $data['designation'] ?? null,
                'date_of_birth'    => $data['date_of_birth'] ?? null,
                'joining_date'     => $data['joining_date'] ?? null,
                'qualification'    => $data['qualification'] ?? null,
                'experience_years' => $data['experience_years'] ?? null,
                'status'           => $data['status'] ?? 'active',
                'photo_url'        => $photoPath,
                'updated_at'       => now()
            ]);

        return true;
    }

    // DELETE TEACHER
    public function deleteTeacher(int $id)
    {
        return DB::table($this->table)->where('teacher_id', $id)->delete();
    }
}

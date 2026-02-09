<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserModel{
    protected string $table = 'tb_users';

    /* =======================
       GET ALL USERS
    ======================= */
    public function getAllUsers(){
        return DB::table($this->table . ' as u')
            ->leftJoin('tb_roles as r', 'r.role_id', '=', 'u.role_id')
            ->select(
                'u.user_id',
                'u.name',
                'u.username',
                'u.email',
                'u.mobile',
                'u.role_id',
                'r.role_name',
                'u.status'
            )
            ->where('u.role_id', '!=', 1) // Exclude role_id = 1
			->orderBy('u.user_id', 'desc')
            ->get();
    }


    /* =======================
       GET USER BY ID
    ======================= */
    public function getUserById(int $id){
		
        $user = DB::table('tb_users as u') 
            ->leftJoin('tb_schools as s', 's.school_id', '=', 'u.school_id')
            ->leftJoin('tb_teachers as t', 't.user_id', '=', 'u.user_id')
            ->leftJoin('tb_parents as p', 'p.user_id', '=', 'u.user_id')
            ->leftJoin('tb_roles as r', 'r.role_id', '=', 'u.role_id')
            ->select(
                'u.user_id',
                'u.role_id',
                'u.username',
                'u.name',
                'u.mobile',
                'u.email',
                'u.status',

                'u.school_id',

                // teacher
                't.qualification',
                't.mobile as teacher_mobile',
                't.photo_url',
				
                // school
                's.school_name',
                's.board',
                's.phone as school_phone',
                's.address_line1 as address',
                's.logo_url as photo_url',

				// role
				'r.role_name',
			
                // parent
                'p.mobile as parent_mobile'
            )
            ->where('u.user_id', $id)
            ->first();
			
        if (!$user) return null;

        // normalize phone
        if ($user->role_id == 2) {
            $user->phone = $user->school_phone;
        } elseif ($user->role_id == 3) {
            $user->phone = $user->teacher_mobile;
        } elseif ($user->role_id == 4) {
            $user->phone = $user->parent_mobile;
        }

        return $user;
    }


    /* =======================
       GET USER BY EMAIL
    ======================= */
    public function getUserByEmail(string $email)
    {
        return DB::table($this->table)
            ->where('email', $email)
            ->first();
    }

    /* ===== CREATE USER ===== */
    public function createUserByRole(array $data, $profile_img="")
    {
        DB::beginTransaction();
        try {
            if ($data['role_id'] === "2") { // School
                $this->createSchoolUser($data, $profile_img);
            } elseif ($data['role_id'] === "3") { // Teacher
                $this->createTeacherUser($data, $profile_img);
            } elseif ($data['role_id'] === "4") { // Parent
                $this->createParentUser($data, $profile_img);
            } else { // Staff or other roles
                $this->createStaffUser($data, $profile_img);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /* ===== SCHOOL FLOW ===== */
    private function createSchoolUser(array $data, $profile_img="")
    {
        // 1️⃣ Create School
        $schoolId = DB::table('tb_schools')->insertGetId([
            'school_code'   => 'SCH-' . strtoupper(Str::random(4)),
            'school_name'   => $data['school_name'],
            'email'         => $data['email'] ?? null,
            'board'         => $data['board'] ?? null,
            'phone'         => $data['phone'] ?? null,
            'address_line1' => $data['address'] ?? null,
            'city'          => $data['city'] ?? null,
            'state'         => $data['state'] ?? null,
            'country'       => $data['country'] ?? null,
            'pincode'       => $data['pincode'] ?? null,
            'status'        => $data['status'],
            'logo_url'      => $profile_img,
            'created_at'    => now(),
        ]);

        // 2️⃣ Create User
        DB::table($this->table)->insert([
            'username'   => $data['username'],
            'email'      => $data['email'] ?? null,
            'password'   => Hash::make($data['password']),
            'role_id'    => $data['role_id'], // numeric ID
            'mobile'     => $data['phone'] ?? null,
            'school_id'  => $schoolId,
            'status'     => $data['status'],
            'created_at' => now(),
        ]);
    }

    /* ===== TEACHER FLOW ===== */
    private function createTeacherUser(array $data, $profile_img="")
    {
        // 1️⃣ Create User
        $userId = DB::table($this->table)->insertGetId([
            'username'   => $data['username'],
            'email'      => $data['email'] ?? null,
            'password'   => Hash::make($data['password']),
            'role_id'    => $data['role_id'],
            'school_id'  => $data['school_id'],
            'mobile'     => $data['phone'] ?? null,
            'status'     => $data['status'],
            'created_at' => now(),
        ]);

        // 2️⃣ Create Teacher
        DB::table('tb_teachers')->insert([
            'user_id'       => $userId,
            'first_name'    => $data['name'] ?? null,
            'email'         => $data['email'] ?? null,
            'school_id'     => $data['school_id'],
            'qualification' => $data['qualification'] ?? null,
            'mobile'         => $data['phone'] ?? null,
            'photo_url'     => $profile_img,
            'created_at'    => now(),
        ]);
    }

    /* ===== PARENT FLOW ===== */
    private function createParentUser(array $data)
    {
        // 1️⃣ Create User
        $userId = DB::table($this->table)->insertGetId([
            'username'   => $data['username'],
            'email'      => $data['email'] ?? null,
            'password'   => Hash::make($data['password']),
            'role_id'    => $data['role_id'],
            'school_id'  => $data['school_id'],
            'status'     => $data['status'],
            'mobile'     => $data['phone'] ?? null,
            'created_at' => now(),
        ]);

        // 2️⃣ Create Parent
        DB::table('tb_parents')->insert([
            'user_id'    => $userId,
            'first_name' => $data['name'] ?? null,
            'email'      => $data['email'] ?? null,
            'school_id'  => $data['school_id'],
            'mobile'     => $data['phone'] ?? null,
            'created_at' => now(),
        ]);
    }

    /* ===== STAFF FLOW ===== */
    private function createStaffUser(array $data)
    {
        DB::table($this->table)->insert([
            'username'   => $data['username'],
            'email'      => $data['email'] ?? null,
            'password'   => Hash::make($data['password']),
            'role_id'    => $data['role_id'],
            'school_id'  => $data['school_id'] ?? null,
            'status'     => $data['status'],
            'created_at' => now(),
        ]);
    }

    /* ===== UPDATE USER ===== */
    /* ================= UPDATE USER (ACS FLOW) ================= */
    public function updateUserByRole(int $userId, array $data, $profile=''){
        DB::beginTransaction();
		if(!empty($data['profile'])){
			$profile = $data['profile'];
		}else if(!empty($data['userprofile'])){
			$profile = $data['userprofile'];
		}else{
			$profile = '';
		}
		
        try {
            $update_user = DB::table($this->table)->where('user_id', $userId)->update([
                'username' => $data['username'],
                'email'    => $data['email'] ?? null,
                'password' => !empty($data['password'])
                                ? Hash::make($data['password'])
                                : DB::raw('password'),
                'status'   => $data['status'],
            ]);

            $user = DB::table($this->table)->where('user_id', $userId)->first();

            if ($user->role_id == 2) {
				$schoold_update_data = array(
                    'school_name' => $data['school_name'],
                    'board'       => $data['board'] ?? null,
                    'address_line1' => $data['address'] ?? null,
                    'phone'       => $data['phone'] ?? null,
                    'status'      => $data['status'],
                    'updated_at' => now(),
                );
				
				if(isset($profile) && !empty($profile)){
					$schoold_update_data['logo_url'] = $profile;
				}
                DB::table('tb_schools')->where('school_id', $user->school_id)->update($schoold_update_data);
            }

            if ($user->role_id == 3) {
                DB::table('tb_teachers')->where('user_id', $userId)->update([
                    'qualification' => $data['qualification'] ?? null,
                    'mobile'        => $data['phone'] ?? null,
					'photo_url' => $profile,
                    'updated_at' => now(),
                ]);
            }

            if ($user->role_id == 4) {
                DB::table('tb_parents')->where('user_id', $userId)->update([
                    'mobile' => $data['phone'] ?? null,
                    'updated_at' => now(),
                ]);
            }

            DB::commit();
			return $update_user;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /* ===== DELETE USER ===== */
    public function deleteUser(int $id) {
        return DB::table($this->table)
            ->where('user_id', $id)
            ->delete();
    }
	/* ===== DELETE USER ===== */
    public function updatePassword($data, $id){
		$user = DB::table($this->table)
			->where('user_id', $id)
			->first();

		// User not found
		if (!$user) {
			return [
				'status' => false,
				'message' => 'User not found'
			];
		}

		// Old password does not match
		if (!Hash::check($data['oldpassword'], $user->password)) {
			return [
				'status' => false,
				'message' => 'Old password is incorrect'
			];
		}
		
		if($data['npassword'] === $data['cpassword']){
			// Update new password
			DB::table($this->table)
				->where('user_id', $id)
				->update([
					'password' => Hash::make($data['npassword'])
				]);

			return [
				'status' => true,
				'message' => 'Password updated successfully'
			];
		}else{
			return [
				'status' => true,
				'message' => 'Confirm  password is incorrect'
			];
		}
	}

}

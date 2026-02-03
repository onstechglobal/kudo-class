<?php
 
namespace App\Models;
 
use Illuminate\Support\Facades\DB;
 
class LoginModel{

    /* GET USER BY EMAIL */
	public function getUserByEmail($email) {
		return DB::table('tb_users as u')
			->leftJoin('tb_roles as r', 'u.role_id', '=', 'r.role_id')
			->where('u.email', $email)
			->where('u.status', 'active')
			->select('u.*', 'r.role_name')
			->first();
	}
	
	public function getUserByEmailapp(array $data){
		if($data['accounttype'] == 'Teacher'){
			return DB::table('tb_users as u')
			->leftJoin('tb_teachers as tr', 'tr.user_id', '=', 'u.user_id')
			->leftJoin('tb_roles as r', 'u.role_id', '=', 'r.role_id')		
			->leftJoin('tb_schools as s', 's.school_id', '=', 'u.school_id')		
			->where('u.email', $data['email'])
			->where('s.school_code', $data['schoolcode'])
			->where('u.status', 'active')
			->select('u.*', 'r.role_name')
			->first();
		}
		
	}


	public function getPermissionsByRoleId($role_id) {

		return DB::table('tb_role_permissions as rp')

			->join('tb_permissions as p', 'rp.permission_id', '=', 'p.permission_id')

			->where('rp.role_id', $role_id)

			->where('rp.status', 'active')

			->where('p.status', 'active')

			->select('p.module', 'p.permission_id') 

			->get()

			->toArray();

	}
 
}
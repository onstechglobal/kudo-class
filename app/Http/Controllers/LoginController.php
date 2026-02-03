<?php
 
namespace App\Http\Controllers;
 
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\LoginModel;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Session;
 
class LoginController extends Controller{
    protected $model;
 
    public function __construct(){
        $this->model = new LoginModel();
    }
 
    public function login(Request $request) {
		$request->validate([
			'email'    => 'required|email',
			'password' => 'required'
		]);
		
		if(!empty($request['schoolcode'])){
			$user = $this->model->getUserByEmailapp($request->all());
		}else{
			$user = $this->model->getUserByEmail($request->email);
		}

		if (!$user || !Hash::check($request->password, $user->password)) {
			return response()->json([
				'status' => false,
				'message' => 'Invalid email or password'
			], 401);
		}

		//SESSION LOGIN
		session([
			'logged_in' => true,
			'user_id'   => $user->user_id,
			'school_id' => $user->school_id
		]);

		// Fetch permissions
		$permissions = $this->model->getPermissionsByRoleId($user->role_id);
		$permissions = !empty($permissions) ? $permissions : [];

		return response()->json([
			'status' => true,
			'message' => 'Login successful',
			'user' => [
				'id'          => $user->user_id,
				'username'    => $user->username,
				'name'   	  => $user->name ?? 'User',
				'email'       => $user->email,
				'school_id'   => $user->school_id,
				'role'        => !empty($user->role_name) ? $user->role_name : '',
				'role_id'     => $user->role_id,
				'permissions' => $permissions
			]
		]);
	}
 
}
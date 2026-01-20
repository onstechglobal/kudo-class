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

    public function login(Request $request){
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required'
        ]);

        $user = $this->model->getUserByEmail($request->email);

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid email or password'
            ], 401);
        }

        // ✅ SESSION LOGIN
        session([
            'logged_in' => true,
            'user_id'   => $user->user_id,
            'school_id' => $user->school_id
        ]);

        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id'   => $user->user_id,
                'name' => $user->name ?? 'Admin',
                'role' => $user->role ?? 'Administrator',
            ]
        ]);
    }

}

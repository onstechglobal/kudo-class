<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserModel;

class UserController extends Controller
{
    protected UserModel $model;

    public function __construct(){
        $this->model = new UserModel();
    }

    /* ====== GET ALL USERS ========= */
    public function index(){
        return response()->json(
            $this->model->getAllUsers()
        );
    }

    /* ===== CREATE USER (ACS FLOW) ===== */
    public function store(Request $request){
        $request->validate([
            'role_id'  => 'required|in:2,3,4,5',
            'username' => 'required',
            'password' => 'required|min:6',
            'status'   => 'required|in:active,inactive',
        ]);

        $this->model->createUserByRole($request->all());

        return response()->json(['message' => 'User created successfully']);
    }

    /* ======== SHOW USER =========== */
    public function show($id){
        $user = $this->model->getUserById($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        return response()->json($user);
    }

    /* =========== UPDATE USER ========== */
    public function update(Request $request, $id){
        $this->model->updateUserByRole($id, $request->all());
        return response()->json(['message' => 'User updated successfully']);
    }

    /* ======== DELETE USER ========== */
    public function destroy($id){
        $this->model->deleteUser($id);
        return response()->json(['message' => 'Deleted']);
    }
}

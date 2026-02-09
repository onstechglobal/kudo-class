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

		$photoName = '';
		if ($request->hasFile('profile')) {
			$file = $request->file('profile');
			$photoName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

			if ($request->role === 'Teacher') {
				$folder = 'teachers';
			} elseif ($request->role === 'Parent') {
				$folder = 'parent';
			} elseif ($request->role === 'School') {
				$folder = 'school';
			} else {
				$folder = 'others';
			}

			$destination = public_path('uploads/' . $folder);
			if (!file_exists($destination)) {
				mkdir($destination, 0777, true);
			}

			$file->move($destination, $photoName);

		}
		
		try {
			$this->model->createUserByRole($request->all(), $photoName);
			return response()->json(['message' => 'User created successfully']);
		} catch (\Exception $e) {
			return response()->json(['error' => $e->getMessage()], 500);
		}
		
    }

    /* ======== SHOW USER =========== */
    public function show($id){		
        $user = $this->model->getUserById($id);
        if (!$user) {
            return response()->json(['status' => false, 'message' => 'User not found'], 404);
        }
        return response()->json(['status' => true, 'user'=>$user]);
		// return response()->json($user);
    }

    /* =========== UPDATE USER ========== */
    public function update(Request $request, $id){
		$data = $request->all();
		
		$photoName = '';
		if ($request->hasFile('profile')) {
			$file = $request->file('profile');
			$photoName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

			if ($request->role === 'Teacher') {
				$folder = 'teachers';
			} elseif ($request->role === 'Parent') {
				$folder = 'parent';
			} else {
				$folder = 'school';
			}

			$destination = public_path('uploads/' . $folder);
			if (!file_exists($destination)) {
				mkdir($destination, 0777, true);
			}

			$file->move($destination, $photoName);

			// add filename to data sent to model
			$data['profile'] = '/'.$folder.'/'.$photoName;
		}
		
		// $this->model->updateUserByRole($id, $data);
	
        // return response()->json(['status' => true, 'message' => 'User updated successfully']);
		
		
		try {
			$response = $this->model->updateUserByRole($id, $data, $photoName);
			if(isset($response) && !empty($response) && $response!=="0"){
				return response()->json(['status' => 'success', 'message' => 'User updated successfully']);
			}else{
				return response()->json(['status' => 'failed', 'message' => 'User update failed']);
			}
			
		} catch (\Exception $e) {
			return response()->json(['error' => $e->getMessage()], 500);
		}
		
    }

    /* ======== DELETE USER ========== */
    public function destroy($id){
        $this->model->deleteUser($id);
        return response()->json(['message' => 'Deleted']);
    }
	
	/* ======== UPDATE PASSWORD ========== */
	public function passwordUpdate(Request $request, $id){
		$user = $this->model->Updatepassword($request->all(), $id);
		return response()->json($user);	
	}
}

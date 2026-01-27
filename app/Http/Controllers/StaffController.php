<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StaffModel;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class StaffController extends Controller
{
    protected StaffModel $model;

    public function __construct() {
        $this->model = new StaffModel();
    }
	
	
	/* ====== GET ALL STAFF (For the list view) ========= */
	public function index(Request $request) {
		$filters = [
			'search' => $request->query('search'),
			'role'   => $request->query('role'),
			'email' => $request->query('email'),
			'mobile' => $request->query('phone'),
		];

		// Get the paginated results from your model
		$staff = $this->model->getStaffList(10, $filters);

		// Calculate stats for the top cards
		$activeCount = \DB::table('tb_staff')->where('status', 'active')->count();
		$inactiveCount = \DB::table('tb_staff')->where('status', 'inactive')->count();

		return response()->json([
			'status'       => 200,
			'data'         => $staff->items(),
			'total'        => $staff->total(),
			'active'       => $activeCount,
			'inactive'     => $inactiveCount,
			'current_page' => $staff->currentPage(),
			'last_page'    => $staff->lastPage(),
			'from'         => $staff->firstItem(), // This provides the "from" number
			'to'           => $staff->lastItem(),  // This provides the "to" number
		]);
	}
	
	

    /* ====== SAVE NEW STAFF RECORD ========= */
    public function savedata(Request $request) {
        // 1. Validation
        $validator = Validator::make($request->all(), [
            'name'      => 'required|string|max:255',
            'email'     => 'required|email',
            'mobile'    => 'required',
            'school_id' => 'required',
            'role'      => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();

		// 2. Handle New File Upload
		if ($request->hasFile('staff_photo')) {
			$file = $request->file('staff_photo');

			$logoName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

			$destination = public_path('uploads/staff_photos');
			if (!file_exists($destination)) {
				mkdir($destination, 0777, true);
			}

			$file->move($destination, $logoName);
		}
		
		if(!isset($logoName) || empty($logoName)){
			$logoName = '';
		}

        // 3. Hash Password (security best practice)
        // Note: 'password_hash' is the name sent from your React form
        if ($request->has('password_hash')) {
            $data['password_hash'] = Hash::make($request->password_hash);
        }

        // 4. Insert into Database
        $resultId = $this->model->insertStaff($data,$logoName);

        return response()->json([
            'status' => $resultId ? 200 : 500,
            'message' => $resultId ? 'Staff Added Successfully' : 'Failed to add staff record',
            'staff_id' => $resultId
        ]);
    }
	
	
	// Fetch for Prefilling
    public function get_single_staff($id) {
        $data = $this->model->getStaffById($id);
        
        if (!$data) {
            return response()->json(['status' => 404, 'message' => 'Not Found'], 404);
        }

        return response()->json([
            'status' => 200,
            'data' => $data
        ]);
    }


    // Update Record
    public function update_staff_record(Request $request, $id) {
        // Handle validation
        $validator = Validator::make($request->all(), [
            'name'      => 'required|string|max:255',
            'email'     => 'required|email',
            'school_id' => 'required',
            'role'      => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 422, 'errors' => $validator->errors()], 422);
        }

        // Data to update (excluding control fields)
        $updateData = $request->except(['_method', 'staff_photo', 'csrf_token']);
        
        // Handle Photo Update
		if ($request->hasFile('staff_photo')) {
			$file = $request->file('staff_photo');

			$logoName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

			$destination = public_path('uploads/staff_photos');
			if (!file_exists($destination)) {
				mkdir($destination, 0777, true);
			}

			$file->move($destination, $logoName);
		}
		
		if(isset($logoName) && !empty($logoName)){
			$updateData['photo_url'] = $logoName;
		}

        $success = $this->model->updateStaff($id, $updateData);

        return response()->json([
            'status' => 200, 
            'message' => 'Staff updated successfully'
        ]);
    }

	
	/**
     * DELETE: Remove a staff member
     */
    public function delete_staff($id) {
        $deleted = $this->model->deleteStaff($id);

        if ($deleted) {
            return response()->json([
                'status' => 200,
                'message' => 'Staff member removed successfully'
            ]);
        }

        return response()->json([
            'status' => 404,
            'message' => 'Record not found'
        ], 404);
    }
	
	
}
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SchoolModel;

class SchoolController extends Controller
{
    protected SchoolModel $model;

    public function __construct(){
        $this->model = new SchoolModel();
    }


	/* ====== GET ALL SCHOOLS WITH FILTERS ========= */
	public function index(Request $request) {
		// Pass the entire request or specific filters to the model
		$filters = [
			'search' => $request->query('search'),
			'board'  => $request->query('board'),
			'status' => $request->query('status'),
		];

		$schools = $this->model->getSchoolList(8, $filters);
		$stats = $this->model->getSchoolStats();

		return response()->json([
			'data'         => $schools->items(),
			'total'        => $schools->total(),
			'active'       => $stats['active'],
			'inactive'     => $stats['inactive'],
			'current_page' => $schools->currentPage(),
			'last_page'    => $schools->lastPage(),
			'from'         => $schools->firstItem(),
			'to'           => $schools->lastItem(),
		]);
	}
	
	
	public function savedata(Request $request) {
		$data = $request->all();

		// 1. Check if Email or Phone already exists
		$existing = $this->model->checkExistingSchool($data['email'], $data['phone']);
		if ($existing) {
			return response()->json([
				'status' => 409, // Conflict
				'message' => 'A school with this email or phone number already exists.'
			]);
		}

		// 2. Handle File Upload (Optional)
		$logoName = null; 
		if ($request->hasFile('school_logo')) {
			$file = $request->file('school_logo');
			$logoName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
			$destination = public_path('uploads/schools');
			
			if (!file_exists($destination)) {
				mkdir($destination, 0777, true);
			}
			$file->move($destination, $logoName);
		}

		// 3. Insert into Database
		$result = $this->model->insertSchool($data, $logoName);
		
		if ($result) {
			$this->model->insertUserData($data, $result);
			return response()->json([
				'status' => 200,
				'message' => 'School Added Successfully'
			]);
		}

		return response()->json([
			'status' => 500,
			'message' => 'Failed to add school'
		]);
	}
	
	
    /* FETCH data for a single school to fill the Edit Form */
    public function getSchoolById($id) {
        $school = $this->model->getSchoolById($id);

        if ($school) {
            return response()->json($school);
        }

        return response()->json(['message' => 'School not found'], 404);
    }
	
	
    
    /* UPDATE the school record in the database */
	public function updateSchool(Request $request, $id) {
		$data = $request->all();

		// 1. Handle New File Upload
		if ($request->hasFile('school_logo')) {
			$file = $request->file('school_logo');

			$logoName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

			$destination = public_path('uploads/schools');
			if (!file_exists($destination)) {
				mkdir($destination, 0777, true);
			}

			$file->move($destination, $logoName);
		}
		
		if(!isset($logoName) || empty($logoName)){
			$logoName = '';
		}

		$result = $this->model->updateSchool($id, $data, $logoName);

		return response()->json([
			'status' => 200,
			'message' => 'School updated successfully!'
		]);
	}
	
	
	/* Delete the school record in the database */
	public function deleteSchool($id) {
		$result = $this->model->deleteSchool($id);

		if ($result) {
			return response()->json([
				'status' => 200,
				'message' => 'Deleted successfully'
			]);
		}

		return response()->json(['status' => 500, 'message' => 'Error deleting record'], 500);
	}


}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StudentModel;

class StudentController extends Controller
{
    protected StudentModel $model;

    public function __construct(){
        $this->model = new StudentModel();
    }
	
	
	
	public function index(Request $request) {
		$filters = [
			'search' => $request->query('search'),
			'status' => $request->query('status'), // 'active' or 'inactive'
		];	

		$list = $this->model->fetchStudents(10, $filters);
		$stats = $this->model->getStudentStats();

		return response()->json([
			'data'           => $list->items(),
			'total'          => $list->total(),
			'active_count'   => $stats['active'],
			'inactive_count' => $stats['inactive'],
			'current_page'   => $list->currentPage(),
			'last_page'      => $list->lastPage(),
			'from'           => $list->firstItem(),
			'to'             => $list->lastItem(),
		]);
	}
		
	
	public function saveStudentData(Request $request) {
		$data = $request->all();
		$photoName = null;

		if ($request->hasFile('photo_url')) {
			$file = $request->file('photo_url');
			
			// Generate unique name for student photo
			$photoName = 'std_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

			$destination = public_path('uploads/students');
			if (!file_exists($destination)) {
				mkdir($destination, 0777, true);
			}

			$file->move($destination, $photoName);
		}

		// Call Model to insert student record
		$result = $this->model->insertStudent($data, $photoName);
		
		return response()->json([
			'status' => $result ? 200 : 500,
			'message' => $result ? 'Student Registered Successfully' : 'Failed to register student'
		]);
	} 
	
	
	
	public function getStudentsList(Request $request) {
		// 1. Get search and filter parameters
		$params = [
			'search' => $request->input('search'),
			'status' => $request->input('status'),
			'page'   => $request->input('page', 1)
		];

		// 2. Call Model to get paginated data
		$students = $this->model->fetchStudents($params);

		// 3. Get counts for the Stats Cards
		$stats = $this->model->getStudentStats();

		// 4. Return formatted JSON response
		return response()->json([
			'status'         => 200,
			'data'           => $students->items(),
			'total'          => $students->total(),
			'active_count'   => $stats['active'],
			'inactive_count' => $stats['inactive'],
			'current_page'   => $students->currentPage(),
			'last_page'      => $students->lastPage(),
			'from'           => $students->firstItem(),
			'to'             => $students->lastItem(),
		]);
	}
	
	
	
	public function updateStudent(Request $request, $id) {
		// 1. Validation
		$request->validate([
			'first_name'   => 'required|string|max:50',
			'admission_no' => 'required|unique:tb_students,admission_no,' . $id . ',student_id',
			'school_id'    => 'required',
			'photo_url'    => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
		]);

		// 2. Prepare Data
		$data = $request->only([
			'school_id', 'admission_no', 'roll_no', 'first_name', 'last_name', 
			'gender', 'dob', 'blood_group', 'class_id', 'section_id', 
			'address', 'city', 'pincode', 'emergency_contact', 'status'
		]);

		// 3. Handle Image Upload
		if ($request->hasFile('photo_url')) {
			$file = $request->file('photo_url');
			$filename = 'std_' . time() . '.' . $file->getClientOriginalExtension();
			$file->move(public_path('uploads/students'), $filename);
			$data['photo_url'] = 'uploads/students/' . $filename;
			
			// Optional: Delete old photo logic here
		}

		// 4. Update via Model
		$update = $this->model->updateStudentData($id, $data);

		if ($update) {
			return response()->json(['status' => 200, 'message' => 'Student updated successfully']);
		}

		return response()->json(['status' => 500, 'message' => 'Failed to update student']);
	}



	/* Delete the school record in the database */
	public function delete_student($id) {
		$result = $this->model->deleteStudent($id);

		if ($result) {
			return response()->json([
				'status' => 200,
				'message' => 'Deleted successfully'
			]);
		}

		return response()->json(['status' => 500, 'message' => 'Error deleting record'], 500);
	}


}

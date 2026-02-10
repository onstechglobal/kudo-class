<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ClassModel;
use Illuminate\Support\Facades\Validator;

class ClassController extends Controller
{
    protected $model;

    public function __construct() {
        $this->model = new ClassModel();
    }

	
	public function saveClass(Request $request) {
		$validator = Validator::make($request->all(), [
			'school_id'     => 'required',
			'class_name'    => 'required|string|max:255',
			'numeric_value' => 'required|numeric', 
			'status'        => 'required|in:active,inactive'
		]);

		if ($validator->fails()) {
			return response()->json([
				'status' => 422,
				'errors' => $validator->errors()
			], 422);
		}

		try {
			$saved = $this->model->saveClass($request->all());

			if ($saved) {
				return response()->json([
					'status'  => 200,
					'message' => 'Class created successfully!'
				]);
			}
		} catch (\Exception $e) {
			return response()->json([
				'status'  => 500,
				'message' => 'Try Again Later',
				'error'   => $e->getMessage()
			], 500);
		}
	}
		
	
    public function get_classes(Request $request) {
        try {
			$school_id = $request->query('school_id');
			
            $classes = $this->model->getAllClasses($school_id);
            return response()->json([
                'status' => 200,
                'data'   => $classes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => $e->getMessage()
            ], 500);
        }
    }
	
	
	public function get_class_by_id($id) {
        $class = $this->model->getClassById($id);
        if ($class) {
            return response()->json(['status' => 200, 'data' => $class]);
        }
        return response()->json(['status' => 404, 'message' => 'Class not found'], 404);
    }

    /**
     * Update existing class
     */
    public function updateClass(Request $request) {
        $validator = Validator::make($request->all(), [
            'class_id'    => 'required',
            'class_name'  => 'required|string|max:255',
            'class_order' => 'required|numeric',
            'status'      => 'required|in:active,inactive'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 422, 'errors' => $validator->errors()], 422);
        }

        try {
            $updated = $this->model->updateClass($request->all());
            return response()->json(['status' => 200, 'message' => 'Class updated successfully!']);
        } catch (\Exception $e) {
            return response()->json(['status' => 500, 'message' => $e->getMessage()], 500);
        }
    }
	
	
	/**
	 * Delete a class
	 */
	public function deleteClass(Request $request) {
		$validator = Validator::make($request->all(), [
			'class_id' => 'required'
		]);

		if ($validator->fails()) {
			return response()->json([
				'status' => 422, 
				'errors' => $validator->errors()
			], 422);
		}

		try {
			$deleted = $this->model->deleteClass($request->class_id);
			
			if ($deleted) {
				return response()->json([
					'status' => 200, 
					'message' => 'Class deleted successfully!'
				]);
			} else {
				return response()->json([
					'status' => 404, 
					'message' => 'Class not found or already deleted.'
				], 404);
			}
		} catch (\Exception $e) {
			return response()->json([
				'status' => 500, 
				'message' => 'Internal Server Error',
				'error' => $e->getMessage()
			], 500);
		}
	}
	
}
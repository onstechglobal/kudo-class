<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AcademicModel;
use Illuminate\Support\Facades\Validator;

class AcademicController extends Controller
{
    protected AcademicModel $model;

    public function __construct(){
        $this->model = new AcademicModel();
    }
	
	
	public function index(Request $request) {
		$filters = [
			'search' => $request->query('search'),
			'status' => $request->query('status'),
			'start_date' => $request->query('start_date'),
			'end_date' => $request->query('end_date'),
		];	

		$list = $this->model->getAcademicList(10, $filters);
		$stats = $this->model->getAcademicStats();

		return response()->json([
			'data'          => $list->items(),
			'total'         => $list->total(),
			'active_count'  => $stats['active'],
			'past_count'    => $stats['past'],
			'current_page'  => $list->currentPage(),
			'last_page'     => $list->lastPage(),
			'from'          => $list->firstItem(),
			'to'            => $list->lastItem(),
		]);
	}						


    /* ====== SAVE NEW ACADEMIC YEAR ========= */
    public function save_academic_data(Request $request) {
        // 1. Validation
        $validator = Validator::make($request->all(), [
            'school_id'  => 'required',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after:start_date',
            'status'     => 'required|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'errors' => $validator->errors()
            ], 422);
        }

        // 2. Insert Data
        $result = $this->model->insertAcademicYear($request->all());

        return response()->json([
            'status' => $result ? 200 : 500,
            'message' => $result ? 'Academic Year Created Successfully' : 'Failed to create record'
        ]);
    }
	
	
	// Helper to decode your scrambled ID
	/* ====== GET SINGLE RECORD ========= */
	public function get_single_year($id) {
		// $id is now a clean integer like 5 or 12
		$data = $this->model->getById($id);
		
		if (!$data) {
			return response()->json(['status' => 404, 'message' => 'Not Found'], 404);
		}

		return response()->json([
			'status' => 200,
			'data' => $data
		]);
	}

	/* ====== UPDATE RECORD ========= */
	public function update_academic_data(Request $request, $id) {
		// Simple numeric ID update
		$result = $this->model->updateYear($id, $request->all());

		return response()->json([
			'status' => $result ? 200 : 500,
			'message' => $result ? 'Updated Successfully' : 'Update Failed'
		]);
	}
	
	
	public function delete_academic_year($id) {
		// 1. Check if ID exists
		$result = $this->model->deleteAcademicYear($id);

		if ($result) {
			return response()->json([
				'status' => 200,
				'message' => 'Academic Year deleted successfully'
			]);
		}

		return response()->json([
			'status' => 500,
			'message' => 'Failed to delete record or record not found'
		], 500);
	}
	
}
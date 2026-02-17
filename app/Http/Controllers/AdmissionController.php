<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AdmissionModel;
use Illuminate\Support\Facades\DB;

class AdmissionController extends Controller
{
    protected $admissionModel;

    public function __construct() {
        $this->admissionModel = new AdmissionModel();
    }

    // NEW: Fetch all available fee policies
    public function getFeePolicies(Request $request) {
        $policies = DB::table('tb_fees_policy')
            ->where('school_id', $request->school_id)
            ->where('status', 'active')
            ->get();

        return response()->json(['success' => true, 'data' => $policies]);
    }

    // NEW: Fetch fees linked to a specific class
   /*  public function getClassFees(Request $request) {
        $classId = $request->class_id;
        
        // Join the mapping table with the structure table
        $fees = DB::table('tb_fee_classes')
            ->join('tb_fee_structures', 'tb_fee_classes.fee_id', '=', 'tb_fee_structures.fee_id')
            ->where('tb_fee_classes.class_id', $classId)
            ->select('tb_fee_structures.*')
            ->get();

        return response()->json(['success' => true, 'data' => $fees]);
    } */
	
	
	public function getClassFees(Request $request) {
		$classId = $request->class_id;
		$schoolId = $request->school_id;

		if (!$classId || !$schoolId) {
			return response()->json([
				'success' => false, 
				'message' => 'Class ID and School ID are required'
			], 400);
		}

		$result = $this->admissionModel->getFeesWithAcademicYear($classId, $schoolId);

		return response()->json([
			'success' => true,
			'data' => $result,
		]);
	}
	
	

    public function store(Request $request) {
        try {
            $result = $this->admissionModel->registerNewAdmission($request->all());
            
            return response()->json([
                'success' => true,
                'message' => 'Admission completed successfully',
                'student_id' => $result
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Admission failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
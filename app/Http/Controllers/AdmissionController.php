<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AdmissionModel;

class AdmissionController extends Controller
{
    protected $admissionModel;

    public function __construct() {
        $this->admissionModel = new AdmissionModel();
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
<?php

namespace App\Http\Controllers;

use App\Models\StudentFeeModel;
use Illuminate\Http\Request;

class StudentFeeController extends Controller
{
    public function index(Request $request)
    {
        try {
            $schoolId = $request->schoolId;
            $userId   = $request->userId; 
            $role     = $request->role; 
            $data = StudentFeeModel::getAllStudentFees($schoolId, $userId, $role);
            return response()->json([
                'status' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => $e->getMessage()
            ]);
        }
    }
}

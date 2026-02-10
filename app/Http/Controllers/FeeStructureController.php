<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\FeeStructureModel;
use App\Models\AcademicModel;
use App\Models\ClassModel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class FeeStructureController extends Controller
{
    /**
     * Display a listing of fees (NON-TRANSPORT ONLY)
     */
    public function index()
    {
        try {
            $feeStructures = FeeStructureModel::with(['classes'])
                ->where('fee_type', '!=', 'transport')
                ->orderBy('created_at', 'desc')
                ->get();

            $academicYearsData = DB::table('tb_academic_years')->get();

            $classModel = new ClassModel();
            $allClasses = $classModel->getAllClasses();

            $formattedData = $feeStructures->map(function ($fee) use ($academicYearsData, $allClasses) {

                // Academic year
                $academicYearName = 'N/A';
                foreach ($academicYearsData as $year) {
                    if ($year->academic_year_id == $fee->academic_year_id) {
                        $academicYearName = $year->year_name;
                        break;
                    }
                }

                // Classes
                $classNames = [];
                $classIds = [];

                foreach ($allClasses as $class) {
                    if (
                        $class->class_id &&
                        $fee->classes->contains('class_id', $class->class_id)
                    ) {
                        $classNames[] = $class->class_name;
                        $classIds[] = $class->class_id;
                    }
                }

                return [
                    'fee_id' => $fee->fee_id,
                    'fee_name' => $fee->fee_name,
                    'amount' => $fee->amount,
                    'fee_type' => $fee->fee_type,
                    'frequency' => $fee->frequency,
                    'status' => $fee->status,
                    'classes' => $classNames,
                    'class_ids' => $classIds,
                    'academic_year' => $academicYearName,
                    'academic_year_id' => $fee->academic_year_id,
                    'created_at' => $fee->created_at
                        ? $fee->created_at->format('d-m-Y')
                        : 'N/A',
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedData,
                'message' => 'Fees fetched successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('FeeStructureController index error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch fees'
            ], 500);
        }
    }

    /**
     * Store a newly created fee
     */
    public function store(Request $request)
    {
        DB::beginTransaction();

        try {
            $validator = Validator::make($request->all(), [
                'fee_name' => 'required|string|max:100',
                'amount' => 'required|numeric|min:0',
                'fee_type' => 'required|in:academic,exam,sports,library,other',
                'frequency' => 'required|in:one_time,monthly,quarterly,annual',
                'status' => 'required|in:active,inactive',
                'academic_year_id' => 'required',
                'class_ids' => 'required|array',
                'class_ids.*' => 'required',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $academicYear = DB::table('tb_academic_years')
                ->where('academic_year_id', $request->academic_year_id)
                ->first();

            if (!$academicYear) {
                return response()->json([
                    'success' => false,
                    'message' => 'Academic year not found'
                ], 404);
            }

            $feeStructure = FeeStructureModel::create([
                'school_id' => $academicYear->school_id ?? 1,
                'academic_year_id' => $request->academic_year_id,
                'fee_name' => $request->fee_name,
                'amount' => $request->amount,
                'fee_type' => $request->fee_type,
                'frequency' => $request->frequency,
                'status' => $request->status,
            ]);

            foreach ($request->class_ids as $classId) {
                DB::table('tb_fee_classes')->insert([
                    'fee_id' => $feeStructure->fee_id,
                    'class_id' => $classId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $feeStructure,
                'message' => 'Fee created successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('FeeStructureController store error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create fee'
            ], 500);
        }
    }

    /**
     * Display a specific fee
     */
    public function show($id)
    {
        try {
            $feeStructure = FeeStructureModel::with(['classes'])->find($id);

            if (!$feeStructure || $feeStructure->fee_type === 'transport') {
                return response()->json([
                    'success' => false,
                    'message' => 'Fee not found'
                ], 404);
            }

            $academicYear = DB::table('tb_academic_years')
                ->where('academic_year_id', $feeStructure->academic_year_id)
                ->first();

            $classModel = new ClassModel();
            $allClasses = $classModel->getAllClasses();

            $assignedClasses = [];
            $assignedClassIds = [];

            foreach ($allClasses as $class) {
                if ($feeStructure->classes->contains('class_id', $class->class_id)) {
                    $assignedClasses[] = [
                        'id' => $class->class_id,
                        'name' => $class->class_name,
                    ];
                    $assignedClassIds[] = $class->class_id;
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'fee_id' => $feeStructure->fee_id,
                    'fee_name' => $feeStructure->fee_name,
                    'amount' => $feeStructure->amount,
                    'fee_type' => $feeStructure->fee_type,
                    'frequency' => $feeStructure->frequency,
                    'status' => $feeStructure->status,
                    'academic_year_id' => $feeStructure->academic_year_id,
                    'academic_year' => $academicYear->year_name ?? null,
                    'classes' => $assignedClasses,
                    'class_ids' => $assignedClassIds,
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('FeeStructureController show error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch fee'
            ], 500);
        }
    }

    /**
     * Update a fee
     */
    public function update(Request $request, $id)
    {
        DB::beginTransaction();

        try {
            $feeStructure = FeeStructureModel::find($id);

            if (!$feeStructure || $feeStructure->fee_type === 'transport') {
                return response()->json([
                    'success' => false,
                    'message' => 'Fee not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'fee_name' => 'required|string|max:100',
                'amount' => 'required|numeric|min:0',
                'frequency' => 'required|in:one_time,monthly,quarterly,annual',
                'status' => 'required|in:active,inactive',
                'class_ids' => 'required|array',
                'class_ids.*' => 'required',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $feeStructure->update([
                'fee_name' => $request->fee_name,
                'amount' => $request->amount,
                'frequency' => $request->frequency,
                'status' => $request->status,
            ]);

            DB::table('tb_fee_classes')
                ->where('fee_id', $feeStructure->fee_id)
                ->delete();

            foreach ($request->class_ids as $classId) {
                DB::table('tb_fee_classes')->insert([
                    'fee_id' => $feeStructure->fee_id,
                    'class_id' => $classId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Fee updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('FeeStructureController update error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to update fee'
            ], 500);
        }
    }

    /**
     * Delete a fee
     */
    public function destroy($id)
    {
        DB::beginTransaction();

        try {
            $feeStructure = FeeStructureModel::find($id);

            if (!$feeStructure || $feeStructure->fee_type === 'transport') {
                return response()->json([
                    'success' => false,
                    'message' => 'Fee not found'
                ], 404);
            }

            DB::table('tb_fee_classes')
                ->where('fee_id', $feeStructure->fee_id)
                ->delete();

            $feeStructure->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Fee deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('FeeStructureController destroy error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete fee'
            ], 500);
        }
    }
}

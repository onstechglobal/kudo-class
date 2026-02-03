<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\FeeStructureModel;
use App\Models\FeeClassModel;
use App\Models\TransportRouteModel;
use App\Models\AcademicModel;
use App\Models\ClassModel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class FeeStructureController extends Controller
{
    /**
     * Display a listing of fee structures.
     */
    public function index(Request $request)
    {
        try {
            // Get fee structures with eager loading
            $feeStructures = FeeStructureModel::with(['classes'])
                ->orderBy('created_at', 'desc')
                ->get();

            // Get academic years data directly from DB
            $academicModel = new AcademicModel();
            $academicYearsData = DB::table('tb_academic_years')->get();
            
            // Get all classes
            $classModel = new ClassModel();
            $allClasses = $classModel->getAllClasses();

            // Format the response with dynamic data
            $formattedData = $feeStructures->map(function ($fee) use ($academicYearsData, $allClasses) {
                // Get academic year name
                $academicYearName = 'N/A';
                foreach ($academicYearsData as $year) {
                    if ($year->academic_year_id == $fee->academic_year_id) {
                        $academicYearName = $year->year_name;
                        break;
                    }
                }
                
                // Get class names for this fee
                $classNames = [];
                $classIds = [];
                
                if ($fee->fee_type !== 'transport') {
                    foreach ($allClasses as $class) {
                        if ($class->class_id && $fee->classes->contains('class_id', $class->class_id)) {
                            $classNames[] = $class->class_name;
                            $classIds[] = $class->class_id;
                        }
                    }
                }
                
                // Get driver name for transport fees
                $driverName = null;
                if ($fee->fee_type === 'transport') {
                    $transportRoute = DB::table('tb_transport_routes')
                        ->where('route_name', $fee->fee_name)
                        ->first();
                    $driverName = $transportRoute->driver_name ?? null;
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
                    'driver_name' => $driverName,
                    'created_at' => $fee->created_at ? $fee->created_at->format('d-m-Y') : 'N/A',
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedData,
                'message' => 'Fee structures fetched successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('FeeStructureController index error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch fee structures: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created fee structure.
     */
    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            // Validate request
            $validator = Validator::make($request->all(), [
                'fee_name' => 'required|string|max:100',
                'amount' => 'required|numeric|min:0',
                'fee_type' => 'required|string|in:academic,exam,sports,library,other,transport',
                'frequency' => $request->fee_type !== 'transport' ? 'required|in:one_time,monthly,quarterly,annual' : 'nullable',
                'status' => 'required|in:active,inactive',
                'academic_year_id' => 'required',
                'driver_name' => $request->fee_type === 'transport' ? 'required|string|max:100' : 'nullable',
                'class_ids' => $request->fee_type !== 'transport' ? 'required|array' : 'nullable|array',
                'class_ids.*' => $request->fee_type !== 'transport' ? 'required' : 'nullable',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get academic year data directly from DB
            $academicYear = DB::table('tb_academic_years')
                ->where('academic_year_id', $request->academic_year_id)
                ->first();
            
            if (!$academicYear) {
                return response()->json([
                    'success' => false,
                    'message' => 'Academic year not found'
                ], 404);
            }

            // Get school_id from academic year or use default
            $schoolId = $academicYear->school_id ?? 1;

            // Create fee structure
            $feeStructure = FeeStructureModel::create([
                'school_id' => $schoolId,
                'academic_year_id' => $request->academic_year_id,
                'fee_name' => $request->fee_name,
                'amount' => $request->amount,
                'fee_type' => $request->fee_type,
                'frequency' => $request->fee_type !== 'transport' ? $request->frequency : null,
                'status' => $request->status,
            ]);

            // If not transport fee, assign classes
            if ($request->fee_type !== 'transport' && !empty($request->class_ids)) {
                foreach ($request->class_ids as $classId) {
                    DB::table('tb_fee_classes')->insert([
                        'fee_id' => $feeStructure->fee_id,
                        'class_id' => $classId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            // If transport fee, create transport route
            if ($request->fee_type === 'transport') {
                DB::table('tb_transport_routes')->insert([
                    'route_name' => $request->fee_name,
                    'monthly_fee' => $request->amount,
                    'academic_year' => $academicYear->year_name,
                    'driver_name' => $request->driver_name,
                    'status' => $request->status,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $feeStructure,
                'message' => 'Fee structure created successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('FeeStructureController store error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create fee structure: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified fee structure.
     */
    public function show($id)
    {
        try {
            $feeStructure = FeeStructureModel::with(['classes'])
                ->find($id);

            if (!$feeStructure) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fee structure not found'
                ], 404);
            }

            // Get academic year info directly from DB
            $academicYear = DB::table('tb_academic_years')
                ->where('academic_year_id', $feeStructure->academic_year_id)
                ->first();

            // Get all classes
            $classModel = new ClassModel();
            $allClasses = $classModel->getAllClasses();

            // Get assigned class IDs and names
            $assignedClasses = [];
            $assignedClassIds = [];
            
            foreach ($allClasses as $class) {
                if ($feeStructure->classes->contains('class_id', $class->class_id)) {
                    $assignedClasses[] = [
                        'id' => $class->class_id,
                        'name' => $class->class_name
                    ];
                    $assignedClassIds[] = $class->class_id;
                }
            }

            // Get transport route if applicable
            $driverName = null;
            if ($feeStructure->fee_type === 'transport') {
                $transportRoute = DB::table('tb_transport_routes')
                    ->where('route_name', $feeStructure->fee_name)
                    ->first();
                $driverName = $transportRoute->driver_name ?? null;
            }

            $data = [
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
                'driver_name' => $driverName,
                'created_at' => $feeStructure->created_at ? $feeStructure->created_at->format('d-m-Y') : 'N/A',
            ];

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Fee structure fetched successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('FeeStructureController show error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch fee structure: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified fee structure.
     */
    public function update(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $feeStructure = FeeStructureModel::find($id);
            
            if (!$feeStructure) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fee structure not found'
                ], 404);
            }

            // Validate request
            $validator = Validator::make($request->all(), [
                'fee_name' => 'required|string|max:100',
                'amount' => 'required|numeric|min:0',
                'frequency' => $feeStructure->fee_type !== 'transport' ? 'required|in:one_time,monthly,quarterly,annual' : 'nullable',
                'status' => 'required|in:active,inactive',
                'driver_name' => $feeStructure->fee_type === 'transport' ? 'required|string|max:100' : 'nullable',
                'class_ids' => $feeStructure->fee_type !== 'transport' ? 'required|array' : 'nullable|array',
                'class_ids.*' => $feeStructure->fee_type !== 'transport' ? 'required' : 'nullable',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get old fee name before update
            $oldFeeName = $feeStructure->fee_name;
            
            // Update fee structure
            $feeStructure->update([
                'fee_name' => $request->fee_name,
                'amount' => $request->amount,
                'frequency' => $feeStructure->fee_type !== 'transport' ? $request->frequency : null,
                'status' => $request->status,
            ]);

            // Update classes for academic fees
            if ($feeStructure->fee_type !== 'transport' && isset($request->class_ids)) {
                // Remove existing class assignments
                DB::table('tb_fee_classes')
                    ->where('fee_id', $feeStructure->fee_id)
                    ->delete();
                
                // Add new class assignments
                foreach ($request->class_ids as $classId) {
                    DB::table('tb_fee_classes')->insert([
                        'fee_id' => $feeStructure->fee_id,
                        'class_id' => $classId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            // Update transport route if applicable
            if ($feeStructure->fee_type === 'transport') {
                // Get academic year name
                $academicYear = DB::table('tb_academic_years')
                    ->where('academic_year_id', $feeStructure->academic_year_id)
                    ->first();
                    
                $transportRoute = DB::table('tb_transport_routes')
                    ->where('route_name', $oldFeeName)
                    ->first();
                
                if ($transportRoute) {
                    DB::table('tb_transport_routes')
                        ->where('route_id', $transportRoute->route_id)
                        ->update([
                            'route_name' => $request->fee_name,
                            'monthly_fee' => $request->amount,
                            'driver_name' => $request->driver_name ?? $transportRoute->driver_name,
                            'status' => $request->status,
                            'updated_at' => now(),
                        ]);
                } else {
                    // Create new if not found
                    DB::table('tb_transport_routes')->insert([
                        'route_name' => $request->fee_name,
                        'monthly_fee' => $request->amount,
                        'academic_year' => $academicYear->year_name ?? 'N/A',
                        'driver_name' => $request->driver_name,
                        'status' => $request->status,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $feeStructure,
                'message' => 'Fee structure updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('FeeStructureController update error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update fee structure: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified fee structure.
     */
    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $feeStructure = FeeStructureModel::find($id);
            
            if (!$feeStructure) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fee structure not found'
                ], 404);
            }

            // Delete related classes from pivot table
            DB::table('tb_fee_classes')
                ->where('fee_id', $feeStructure->fee_id)
                ->delete();

            // Delete transport route if applicable
            if ($feeStructure->fee_type === 'transport') {
                DB::table('tb_transport_routes')
                    ->where('route_name', $feeStructure->fee_name)
                    ->delete();
            }

            // Delete fee structure
            $feeStructure->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Fee structure deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('FeeStructureController destroy error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete fee structure: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get fee structure statistics.
     */
    public function getStats()
    {
        try {
            $total = FeeStructureModel::count();
            $academic = FeeStructureModel::where('fee_type', '!=', 'transport')->count();
            $transport = FeeStructureModel::where('fee_type', 'transport')->count();
            $active = FeeStructureModel::where('status', 'active')->count();
            $inactive = FeeStructureModel::where('status', 'inactive')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'total' => $total,
                    'academic' => $academic,
                    'transport' => $transport,
                    'active' => $active,
                    'inactive' => $inactive,
                ],
                'message' => 'Statistics fetched successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('FeeStructureController getStats error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get classes assigned to a specific fee structure.
     */
    public function getFeeClasses($feeId)
    {
        try {
            $classes = DB::table('tb_fee_classes as fc')
                ->join('tb_classes as c', 'fc.class_id', '=', 'c.class_id')
                ->where('fc.fee_id', $feeId)
                ->select('fc.class_id as id', 'c.class_name as name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $classes,
                'message' => 'Fee classes fetched successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('FeeStructureController getFeeClasses error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch fee classes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign classes to a fee structure.
     */
    public function assignClasses(Request $request, $feeId)
    {
        try {
            $feeStructure = FeeStructureModel::find($feeId);
            
            if (!$feeStructure) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fee structure not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'classes' => 'required|array',
                'classes.*' => 'required',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            foreach ($request->classes as $classId) {
                // Check if already assigned
                $exists = DB::table('tb_fee_classes')
                    ->where('fee_id', $feeId)
                    ->where('class_id', $classId)
                    ->exists();
                
                if (!$exists) {
                    DB::table('tb_fee_classes')->insert([
                        'fee_id' => $feeId,
                        'class_id' => $classId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Classes assigned successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('FeeStructureController assignClasses error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign classes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove classes from a fee structure.
     */
    public function removeClasses(Request $request, $feeId)
    {
        try {
            $validator = Validator::make($request->all(), [
                'class_ids' => 'required|array',
                'class_ids.*' => 'required',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::table('tb_fee_classes')
                ->where('fee_id', $feeId)
                ->whereIn('class_id', $request->class_ids)
                ->delete();

            return response()->json([
                'success' => true,
                'message' => 'Classes removed successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('FeeStructureController removeClasses error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove classes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get active academic years for dropdown
     */
    public function getAcademicYears()
    {
        try {
            // Get active academic years directly from DB
            $academicYears = DB::table('tb_academic_years')
                ->where('is_active', 1)
                ->orderBy('year_name', 'desc')
                ->get(['academic_year_id as id', 'year_name as name']);
            
            return response()->json([
                'success' => true,
                'data' => $academicYears,
                'message' => 'Academic years fetched successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('FeeStructureController getAcademicYears error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch academic years: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all classes for dropdown
     */
    public function getAllClasses()
    {
        try {
            $classModel = new ClassModel();
            $classes = $classModel->getAllClasses();
            
            $formattedClasses = [];
            foreach ($classes as $class) {
                $formattedClasses[] = [
                    'id' => $class->class_id,
                    'name' => $class->class_name
                ];
            }
            
            return response()->json([
                'success' => true,
                'data' => $formattedClasses,
                'message' => 'Classes fetched successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('FeeStructureController getAllClasses error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch classes: ' . $e->getMessage()
            ], 500);
        }
    }
}
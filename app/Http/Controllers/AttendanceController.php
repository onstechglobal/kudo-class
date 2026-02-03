<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\AttendanceModel;

class AttendanceController extends Controller
{
    /**
     * Get students with their attendance status for a specific date
     */
    public function students(Request $request)
    {
        try {
            $students = AttendanceModel::getStudentsWithAttendance(
                $request->school_id,
                $request->class_id,
                $request->section_id,
                $request->date
            );
            
            // Ensure we always return an array, even if empty
            return response()->json($students ?: []);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch students: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Save attendance records
     */
    public function save(Request $request)
    {
        DB::beginTransaction();
        try {
            // Delete existing attendance for the date
            AttendanceModel::deleteAttendance(
                $request->school_id,
                $request->class_id,
                $request->section_id,
                $request->date
            );

            // Prepare attendance data for insertion
            $attendanceData = [];
            foreach ($request->attendance as $row) {
                $attendanceData[] = [
                    'school_id' => $request->school_id,
                    'student_id' => $row['student_id'],
                    'class_id' => $request->class_id,
                    'section_id' => $request->section_id,
                    'date' => $request->date,
                    'status' => $row['status'],
                    'remarks' => $row['remarks'] ?? null,
                    'marked_by_user_id' => auth()->id(),
                    'marked_at' => now()
                ];
            }

            // Insert new attendance records
            AttendanceModel::insertAttendance($attendanceData);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Attendance saved successfully'
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to save attendance: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get student statistics for analytics page
     */
    public function studentStats($studentId)
    {
        try {
            $currentYear = date('Y');
            
            // Get monthly statistics for chart
            $monthlyStats = AttendanceModel::getStudentMonthlyStats($studentId, $currentYear);
            
            // Get yearly statistics for cards
            $yearlyStats = AttendanceModel::getStudentYearlyStats($studentId, $currentYear);

            return response()->json([
                'success' => true,
                'monthly_stats' => $monthlyStats ?: [],
                'yearly_stats' => $yearlyStats ?: (object)[
                    'total_days' => 0,
                    'present_days' => 0,
                    'absent_days' => 0,
                    'leave_days' => 0,
                    'attendance_rate' => 0
                ],
                'current_year' => $currentYear
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch student statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get monthly attendance for heatmap
     */
    public function monthlyAttendance($studentId, Request $request)
    {
        try {
            $year = $request->input('year', date('Y'));
            $month = $request->input('month', date('n'));
            
            $attendance = AttendanceModel::getMonthlyAttendance($studentId, $year, $month);
            
            return response()->json([
                'success' => true,
                'data' => $attendance ?: []
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch monthly attendance: ' . $e->getMessage()
            ], 500);
        }
    }
}
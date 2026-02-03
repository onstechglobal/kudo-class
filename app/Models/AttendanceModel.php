<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class AttendanceModel extends Model
{
    protected $table = 'tb_attendance_students';

    /**
     * PURPOSE: Get students with attendance for a specific date
     * USED IN: Attendance list view to show all students with their attendance status
     */
    public static function getStudentsWithAttendance($school_id, $class_id, $section_id, $date)
    {
        return DB::table('tb_students as s')
            ->leftJoin('tb_attendance_students as a', function ($join) use ($date) {
                $join->on('a.student_id', '=', 's.student_id')
                     ->where('a.date', $date);
            })
            ->where([
                's.school_id' => $school_id,
                's.class_id' => $class_id,
                's.section_id' => $section_id,
                's.status' => 'active'
            ])
            ->select(
                's.student_id',
                's.roll_no',
                DB::raw("CONCAT(s.first_name,' ',s.last_name) as name"),
                DB::raw("IFNULL(a.status,'present') as status"),
                'a.remarks'
            )
            ->orderBy('s.roll_no')
            ->get();
    }

    /**
     * PURPOSE: Delete existing attendance for a specific date
     * USED IN: When saving new attendance, delete old records first
     */
    public static function deleteAttendance($school_id, $class_id, $section_id, $date)
    {
        return DB::table('tb_attendance_students')
            ->where([
                'school_id' => $school_id,
                'class_id' => $class_id,
                'section_id' => $section_id,
                'date' => $date
            ])->delete();
    }

    /**
     * PURPOSE: Insert attendance records
     * USED IN: Save new attendance records after deleting old ones
     */
    public static function insertAttendance($attendanceData)
    {
        return DB::table('tb_attendance_students')->insert($attendanceData);
    }

    /**
     * PURPOSE: Get student monthly statistics for chart
     * USED IN: Student analytics page - monthly chart data
     */
    public static function getStudentMonthlyStats($studentId, $year)
    {
        return DB::table('tb_attendance_students')
            ->selectRaw("
                MONTH(date) as month,
                COUNT(*) as total_days,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
                SUM(CASE WHEN status = 'leave' THEN 1 ELSE 0 END) as leave_days,
                ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as percentage
            ")
            ->where('student_id', $studentId)
            ->whereYear('date', $year)
            ->groupByRaw('MONTH(date)')
            ->get();
    }

    /**
     * PURPOSE: Get student yearly statistics for cards
     * USED IN: Student analytics page - summary cards (Attendance Rate, Total Present, etc.)
     */
    public static function getStudentYearlyStats($studentId, $year)
    {
        return DB::table('tb_attendance_students')
            ->selectRaw("
                COUNT(*) as total_days,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
                SUM(CASE WHEN status = 'leave' THEN 1 ELSE 0 END) as leave_days,
                ROUND((SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as attendance_rate
            ")
            ->where('student_id', $studentId)
            ->whereYear('date', $year)
            ->first();
    }

    /**
     * PURPOSE: Get monthly attendance for heatmap
     * USED IN: Student analytics page - monthly heatmap (shows daily attendance colors)
     */
    public static function getMonthlyAttendance($studentId, $year, $month)
    {
        return DB::table('tb_attendance_students')
            ->select('date', 'status')
            ->where('student_id', $studentId)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->orderBy('date')
            ->get();
    }
}
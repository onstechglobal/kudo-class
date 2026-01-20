<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller{
    public function index(Request $request){
        return response()->json([
            "kpi" => [
                "students" => 1280,
                "teachers" => 75,
                "parents" => 1200,
                "attendance" => 92,
            ],

            "alerts" => [
                "Attendance not marked for Class 3A and 5B",
                "₹ 85,400 fees pending collection",
                "17 parents have not logged in yet",
                "6 notifications failed to send",
            ],

            "today" => [
                "events" => 2,
                "exams" => 1,
                "circulars" => 3,
                "holidays" => 0,
            ],

            "attendance_chart" => [
                "today" => 92,
                "yesterday" => 89,
                "weekly_avg" => 87,
            ],

            "fees" => [
                "due" => 120000,
                "collected" => 365000,
                "outstanding" => 85400,
            ],
        ]);
    }
}

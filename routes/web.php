<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\AcademicController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\ParentController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SectionController;


Route::get('/', function () {
    if (Session::get('logged_in')) {
        return redirect('/dashboard');
    }
    return view('app');
});

Route::post('/login', [LoginController::class, 'login']);

Route::post('/logout', function () {
    session()->flush(); // destroy session
    return response()->json(['message' => 'Logged out']);
});

Route::middleware('auth.check')->group(function () {
    Route::get('/dashboard', fn () => view('app'));
    Route::get('/admin/{any}', fn () => view('app'))->where('any', '.*');
});

Route::get('/school_data', [SchoolController::class, 'index']);
Route::post('/schooldata', [SchoolController::class, 'savedata']);
Route::get('/get-school/{id}', [SchoolController::class, 'getSchoolById']);
//Route::post('/update-school/{id}', [SchoolController::class, 'updateSchool']);
Route::post('/delete-school/{id}', [SchoolController::class, 'deleteSchool']);
Route::match(['post', 'put'], '/update-school/{id}', [SchoolController::class, 'updateSchool']);


Route::get ('get-students-list', [StudentController::class, 'index']);
Route::post('studentdata', [StudentController::class, 'saveStudentData']);
Route::post('delete-student/{id}', [StudentController::class, 'delete_student']);


Route::get('get_staff_data', [StaffController::class, 'index']);
Route::post('staffdata', [StaffController::class, 'savedata']);
Route::get('get-staff/{id}', [StaffController::class, 'get_single_staff']);
Route::put('update-staff/{id}', [StaffController::class, 'update_staff_record']);
Route::post('delete-staff/{id}', [StaffController::class, 'delete_staff']);


Route::get('/academic-data', [AcademicController::class, 'index']);
Route::post('/save-academic-year', [AcademicController::class, 'save_academic_data']);
Route::get('get-academic-year/{id}', [AcademicController::class, 'get_single_year']);
Route::post('update-academic-year/{id}', [AcademicController::class, 'update_academic_data']);
Route::post('delete-academic-year/{id}', [AcademicController::class, 'delete_academic_year']);


Route::get('/teacher', [TeacherController::class, 'index']);
Route::post('/teacher', [TeacherController::class, 'store']);
Route::get('/teacher/{id}', [TeacherController::class, 'show']);
Route::post('/update-teacher/{id}', [TeacherController::class, 'update']);
Route::post('/delete-teacher/{id}', [TeacherController::class, 'destroy']);

Route::get('/parent', [ParentController::class, 'index']);    
Route::post('/parents', [ParentController::class, 'store']);          
Route::get('/parents/{id}', [ParentController::class, 'show'])->where('id', '[0-9]+');
Route::post('/update-parent/{id}', [ParentController::class, 'update']); 
Route::post('/delete-parent/{id}', [ParentController::class, 'destroy']);


Route::get('/section', [SectionController::class, 'index']);
Route::get('/section/classes', [SectionController::class, 'getClasses']);
Route::get('/section/teachers', [SectionController::class, 'getTeachers']);
Route::post('/section', [SectionController::class, 'store']);
Route::get('/section/{id}', [SectionController::class, 'show']);
Route::post('/update-section/{id}', [SectionController::class, 'update']);
Route::post('/delete-section/{id}', [SectionController::class, 'destroy']);

Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);

Route::get('/roles', [RoleController::class, 'index']);
Route::post('/roles', [RoleController::class, 'store']);
Route::get('/roles/{id}', [RoleController::class, 'show']);
Route::put('/roles/{id}', [RoleController::class, 'update']);
Route::delete('/roles/{id}', [RoleController::class, 'destroy']);

Route::get('/permissions', [PermissionController::class, 'index']);
Route::post('/permissions', [PermissionController::class, 'store']);
Route::get('/permissions/{id}', [PermissionController::class,'show']);
Route::put('/permissions/{id}', [PermissionController::class,'update']);
Route::delete('/permissions/{id}', [PermissionController::class,'destroy']);

Route::get('/csrf-token', function () {
    return response()->json(['csrfToken' => csrf_token()]);
});

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');

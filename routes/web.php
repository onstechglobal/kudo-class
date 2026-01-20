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

Route::get('/school', [SchoolController::class, 'index']);
Route::post('/schooldata', [SchoolController::class, 'savedata']);
Route::get('/get-school/{id}', [SchoolController::class, 'getSchoolById']);
//Route::post('/update-school/{id}', [SchoolController::class, 'updateSchool']);
Route::post('/delete-school/{id}', [SchoolController::class, 'deleteSchool']);
Route::match(['post', 'put'], '/update-school/{id}', [SchoolController::class, 'updateSchool']);

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
Route::get('/roles/{roleId}/permissions', [PermissionController::class, 'rolePermissions']);
Route::post('/roles/{roleId}/permissions', [PermissionController::class, 'updateRolePermissions']);

Route::get('/role-permissions', [RolePermissionController::class,'index']);
Route::post('/role-permissions', [RolePermissionController::class,'store']);
Route::get('/role-permissions/{id}', [RolePermissionController::class,'show']);
Route::put('/role-permissions/{id}', [RolePermissionController::class,'update']);
Route::delete('/role-permissions/{id}', [RolePermissionController::class,'destroy']);

Route::get('/csrf-token', function () {
    return response()->json(['csrfToken' => csrf_token()]);
});

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');

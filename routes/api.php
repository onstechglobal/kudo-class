<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\RolePermissionController;

Route::get('/dashboard', [DashboardController::class, 'index']);

Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);

Route::get('/roles', function () {
    return \App\Models\Role::select('role_id', 'role_name')->get();
});

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





<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\DashboardController;

Route::get('/', function () {
    return view('app');
});
Route::post('/login', [AuthController::class, 'login']);
Route::get('/dashboard', function () {
    return view('app');
});
<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;



// This loads the initial page for the website
Route::get('/', function () {
    if (Session::get('logged_in')) {
        return redirect('/dashboard');
    }
    return view('app');
});

Route::get('/dashboard', function () {
    if (!Session::get('logged_in')) { return redirect('/'); }
    return view('app');
});

Route::get('/terms-of-use', function () {
    return view('app');
});

Route::get('/privacy-policy', function () {
    return view('app');
});

// Catch-all for web navigation (SPA)
Route::middleware('auth.check')->group(function () {
    Route::get('/{any}', function () {
        return view('app');
    })->where('any', '.*');
});

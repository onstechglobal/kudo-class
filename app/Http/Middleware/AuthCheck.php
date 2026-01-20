<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AuthCheck
{
    public function handle(Request $request, Closure $next)
    {
        if (!session()->get('logged_in')) {
            return redirect('/');
        }

        return $next($request);
    }
}

<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;

class LoginModel{
    /* GET USER BY EMAIL */
    public function getUserByEmail($email){
        return DB::table('tb_users')
            ->where('email', $email)
            ->where('status', 'active')
            ->first();
    }

}

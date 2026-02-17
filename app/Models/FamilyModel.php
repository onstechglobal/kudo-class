<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;

class FamilyModel
{
    public function getFamilies($params)
    {
        $query = DB::table('tb_families')
            ->select('id', 'address_line1', 'city', 'phone_number', 'created_at');

        if (!empty($params['search'])) {
            $query->where(function($q) use ($params) {
                $q->where('phone_number', 'like', '%' . $params['search'] . '%')
                  ->orWhere('city', 'like', '%' . $params['search'] . '%')
                  ->orWhere('address_line1', 'like', '%' . $params['search'] . '%');
            });
        }

        return $query->orderBy('id', 'desc')->get();
    }
}
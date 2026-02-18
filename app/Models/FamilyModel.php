<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;

class FamilyModel {
    
    public function getFamilies($params) {
        $perPage = $params['per_page'] ?? 10;

        $query = DB::table('tb_families')
            ->leftJoin('tb_parents', 'tb_families.id', '=', 'tb_parents.family_id')
			->where(function($q) {
				$q->where('tb_families.status', '!=', 'deleted')
				  ->orWhereNull('tb_families.status')
				  ->orWhere('tb_families.status', '=', '');
			})
            ->select(
                'tb_families.id',
                'tb_families.address_line1',
                'tb_families.address_line2',
                'tb_families.city',
                'tb_families.state',
                'tb_families.district',
                'tb_families.pincode',
                'tb_families.phone_number',
                'tb_families.created_at',
               DB::raw("GROUP_CONCAT(
                    CONCAT(
                        IFNULL(tb_parents.first_name,''), ' ', IFNULL(tb_parents.last_name,''), 
                        ':', 
                        IFNULL(tb_parents.mobile,'')
                    ) SEPARATOR '||'
                ) as parent_details")
            )
            ->groupBy(
                'tb_families.id', 
                'tb_families.address_line1', 
                'tb_families.address_line2', 
                'tb_families.city', 
                'tb_families.state', 
                'tb_families.district', 
                'tb_families.pincode', 
                'tb_families.phone_number', 
                'tb_families.created_at'
            );

        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->where(function ($q) use ($search) {
                $q->where('tb_families.phone_number', 'like', "%$search%")
                  ->orWhere('tb_families.city', 'like', "%$search%")
                  ->orWhere('tb_parents.first_name', 'like', "%$search%")
                  ->orWhere('tb_parents.last_name', 'like', "%$search%");
            });
        }

        return $query->orderBy('tb_families.id', 'desc')
                     ->paginate($perPage);
    }
	
	
	public function getFamilyById($id) {
		return DB::table('tb_families')
			->where('id', $id)
			->first();
	}

	public function updateFamily($id, $data) {
		// Add updated_at timestamp
		$data['updated_at'] = now();
		
		return DB::table('tb_families')
			->where('id', $id)
			->update($data);
	}

 
    public function deleteFamily($id) {
        return DB::table('tb_families')
            ->where('id', $id)
            ->update(['status' => 'deleted', 'updated_at' => now()]);
            
        // return DB::table('tb_families')->where('id', $id)->delete();
    }
}
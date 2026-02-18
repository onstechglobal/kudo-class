<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;

class ParentModel
{
    protected string $table = 'tb_parents';

    /**
     * Create parent record
     */
   /*  public function create(array $data, int $userId)
    {
        return DB::table($this->table)->insert([
            'school_id'         => $data['school_id'] ?? 1,
            'user_id'           => $userId,
            'first_name'        => $data['first_name'],
            'last_name'         => $data['last_name'] ?? null,
            'email'             => $data['email'],
            'mobile'            => $data['mobile'],
            'alternate_mobile'  => $data['alternate_mobile'] ?? null,
            'status'            => $data['status'] ?? 'active',
            'created_at'        => now(),
        ]);
    } */
	
	
	/**
	 * Insert into tb_users
	 */
	public function createUser(array $userData){
		return DB::table('tb_users')->insertGetId([
			'username'   => $userData['username'],
			'name'       => $userData['name'],
			'email'      => $userData['email'],
			'mobile'     => $userData['mobile'],
			'password'   => $userData['password'],
			'role_id'    => 4, 
			'status'     => 'active',
			'created_at' => now()
		]);
	}


	/**
	 * Insert into tb_families
	 */
	public function createFamily(array $familyData){
		return DB::table('tb_families')->insertGetId([
			'address_line1' => $familyData['address_line1'],
			'address_line2' => $familyData['address_line2'] ?? null,
			'city'          => $familyData['city'],
			'state'         => $familyData['state'],
			'district'      => $familyData['district'],
			'pincode'       => $familyData['pincode'],
			'country'       => $familyData['country'],
			'created_at'    => now(),
			'updated_at'    => now()
		]);
	}


	/**
	 * Insert into tb_parents
	 */
	public function createParent(array $data, int $userId, int $familyId){
		return DB::table('tb_parents')->insert([
			'school_id'         => $data['school_id'] ?? 1,
			'user_id'           => $userId,
			'family_id'         => $familyId,
			'first_name'        => $data['first_name'],
			'last_name'         => $data['last_name'] ?? null,
			'email'             => $data['email'],
			'mobile'            => $data['mobile'],
			'is_primary'        => $data['is_primary'] ?? 1,
			'parent_type'       => $data['parent_type'] ?? 'normal',
			'status'            => $data['status'] ?? 'active',
			'created_at'        => now(),
			'updated_at'        => now()
		]);
	}
	
	
	public function searchParents($searchTerm) {
		return DB::table('tb_parents')
			->select('parent_id as id', 'first_name', 'last_name', 'mobile')
			->where(function($query) use ($searchTerm) {
				$query->where('first_name', 'LIKE', "%{$searchTerm}%")
					  ->orWhere('last_name', 'LIKE', "%{$searchTerm}%");
			})
			->where('status', 'active')
			->limit(10)
			->get();
	}
	

    /**
     * Parent listing (JOIN WITH USERS – SAME AS TEACHER)
     */
    public function getAllParents11(){
		return DB::table('tb_parents as p')
			->join('tb_users as u', 'u.user_id', '=', 'p.user_id')
			->leftJoin('tb_families as f', 'p.family_id', '=', 'f.id')
			->select(
				'p.*',
				'u.username',
				'f.city',           // New field
				'f.address_line1'   // New field
			)
			->orderBy('p.parent_id', 'desc')
			->get();
	}
	
	
	public function getAllParents() {
		return DB::table('tb_parents as p')
			// Use leftJoin here so parents without users aren't filtered out
			->leftJoin('tb_users as u', 'u.user_id', '=', 'p.user_id')
			
			// Use leftJoin here so parents without family records aren't filtered out
			->leftJoin('tb_families as f', 'p.family_id', '=', 'f.id')
			
			->select(
				'p.*',                // All parent columns (12 rows)
				'u.username',         // Will be NULL for the 5 parents without users
				'f.address_line1',    // Family details
				'f.city',
				'f.state',
				'f.pincode'
			)
			->orderBy('p.parent_id', 'desc')
			->get();
	}
	
	
	// ParentModel.php

	/**
	 * Fetch a single parent with family data
	 */
	public function getParentById($id){
		return DB::table('tb_parents as p')
			->leftJoin('tb_families as f', 'p.family_id', '=', 'f.id')
			->where('p.parent_id', $id)
			->select('p.*', 'f.address_line1', 'f.address_line2', 'f.city', 'f.state', 'f.district', 'f.pincode', 'f.country')
			->first();
	}

	/**
	 * Update Parent + User + Family
	 */
	public function updateParentData($id, array $data, $userId, $familyId){
		// 1. Update User Table
		DB::table('tb_users')->where('user_id', $userId)->update([
			'name'   => $data['first_name'] . ' ' . ($data['last_name'] ?? ''),
			'email'  => $data['email'],
			'mobile' => $data['mobile'],
		]);

		// 2. Update Family Table
		if ($familyId) {
			DB::table('tb_families')->where('id', $familyId)->update([
				'address_line1' => $data['address_line1'],
				'address_line2' => $data['address_line2'] ?? null,
				'city'          => $data['city'],
				'district'      => $data['district'],
				'state'         => $data['state'],
				'pincode'       => $data['pincode'],
				'country'       => $data['country'] ?? 'India',
				'updated_at'    => now()
			]);
		}

		// 3. Update Parent Table
		return DB::table('tb_parents')->where('parent_id', $id)->update([
			'first_name'        => $data['first_name'],
			'last_name'         => $data['last_name'] ?? null,
			'email'             => $data['email'],
			'mobile'            => $data['mobile'],
			'alternate_mobile'  => $data['alternate_mobile'] ?? null,
			'status'            => $data['status'],
			'updated_at'        => now()
		]);
	}
		
	
}

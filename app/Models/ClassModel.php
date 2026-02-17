<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ClassModel extends Model
{
    protected $table = 'tb_classes';
    
    /**
     * Save Class - Instance Method
    */
	
	public function saveClass($data) {
        return DB::table($this->table)->insert([
            'school_id'     => $data['school_id'], // Dynamic from local storage
            'class_name'    => $data['class_name'],
            // 'numeric_value' => $data['numeric_value'],
            // 'department'    => $data['department'], 
            'class_order'   => $data['class_order'],
            'status'        => $data['status'],
            'created_at'    => now()
        ]);
    }
	
    
    /**
     * Get All Classes with Join - Instance Method
     */
	 
	public function getAllClasses($school_id, $filters=[]) {
		return DB::table('tb_classes')
			->where('school_id', $school_id)
			->when(!empty($filters['search']), function ($query) use ($filters) {
				$query->where(function($q) use ($filters) {
					$q->where('class_name', 'like', '%' . $filters['search'] . '%');
				});
			})
			->when(!empty($filters['status']), function ($query) use ($filters) {
				$query->where(function($q) use ($filters) {
					$q->where('status', $filters['status']);
				});
			})
			->when(!empty($filters['category']), function ($query) use ($filters) {
				$query->where(function($q) use ($filters) {
					$q->where('department', $filters['category']);
				});
			})
			->orderBy('class_order', 'asc')
			->get();
	}
		
	
	/**
     * Fetch class by ID
     */
    public function getClassById($id) {
        return DB::table('tb_classes')
            ->where('class_id', $id)
            ->first();
    }

    /**
     * Update record
     */
	public function updateClass($data) {
        return DB::table($this->table)
            ->where('class_id', $data['class_id'])
            ->update([
                'class_name'    => $data['class_name'],
                // 'numeric_value' => $data['numeric_value'],
                // 'department'    => $data['department'],
                'class_order'   => $data['class_order'],
                'status'        => $data['status'],
                //'updated_at'    => now()
            ]);
    }
	
	
	/**
	 * Delete record
	 */
	public function deleteClass($id) {
		return DB::table('tb_classes')
			->where('class_id', $id)
			->delete();
	}
	
}
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
        return DB::table('tb_classes')->insert([
            'school_id'   => 10, // Hardcoded for now per your code
            'class_name'  => $data['class_name'],
            'class_order' => $data['class_order'],
            'status'      => $data['status'],
            'created_at'  => now()
        ]);
    }
    
    /**
     * Get All Classes with Join - Instance Method
     */
    public function getAllClasses() {
        return DB::table('tb_classes as c')
            ->select(
                'c.class_id',
                'c.class_name',
                'c.class_order',
                'c.status',
                'c.school_id',
                's.school_name', 
                'c.created_at'
            )
            ->join('tb_schools as s', 'c.school_id', '=', 's.school_id')
            ->orderBy('c.class_order', 'asc')
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
        return DB::table('tb_classes')
            ->where('class_id', $data['class_id'])
            ->update([
                'class_name'  => $data['class_name'],
                'class_order' => $data['class_order'],
                'status'      => $data['status'],
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
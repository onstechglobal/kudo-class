<?php
namespace App\Models;

use Illuminate\Support\Facades\DB;

class SectionModel
{
    protected string $table = 'tb_sections';

	public function create(array $data){
		return DB::table($this->table)->insert([
			'school_id'         => $data['school_id'], 
			'class_id'          => $data['class_id'],
			'section_name'      => $data['section_name'],
			// Handle the "Select Teacher" empty string by converting it to null
			'class_teacher_id'  => (!empty($data['class_teacher_id'])) ? $data['class_teacher_id'] : null,
			'status'            => $data['status'] ?? 'active',
			'created_at'        => now(),
		]);
	}
	
	

    public function getAllSections($filters = [])
    {
        return DB::table('tb_sections as s')
            ->leftJoin('tb_classes as c', 'c.class_id', '=', 's.class_id')
            ->leftJoin('tb_teachers as t', 't.teacher_id', '=', 's.class_teacher_id')
            ->select(
                's.section_id',
                's.section_name',
                's.status',
                'c.class_name',
                DB::raw('CONCAT(t.first_name, " ", t.last_name) as class_teacher_name'),
                's.created_at'
            )
			->when(!empty($filters['search']), function ($query) use ($filters) {
				$query->where(function($q) use ($filters) {
					$q->where('s.section_name', 'like', '%' . $filters['search'] . '%');
				});
			})
			->when(!empty($filters['status']), function ($query) use ($filters) {
				$query->where(function($q) use ($filters) {
					$q->where('s.status', $filters['status']);
				});
			})
			->when(!empty($filters['class']), function ($query) use ($filters) {
				$query->where(function($q) use ($filters) {
					$q->where('s.class_id', $filters['class']);
				});
			})
			->when(!empty($filters['teacher']), function ($query) use ($filters) {
				$query->where(function($q) use ($filters) {
					$q->where('s.class_teacher_id', $filters['teacher']);
				});
			})
            ->orderBy('s.section_id', 'desc')
            ->get();
    }

}
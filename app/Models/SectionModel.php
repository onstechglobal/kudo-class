<?php
namespace App\Models;

use Illuminate\Support\Facades\DB;

class SectionModel
{
    protected string $table = 'tb_sections';

    public function create(array $data)
    {
        return DB::table($this->table)->insert([
            'school_id'         => $data['school_id'] ?? 1,
            'class_id'          => $data['class_id'],
            'section_name'      => $data['section_name'],
            'class_teacher_id'  => $data['class_teacher_id'] ?? null,
            'status'            => $data['status'] ?? 'active',
            'created_at'        => now(),
        ]);
    }

    public function getAllSections()
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
            ->orderBy('s.section_id', 'desc')
            ->get();
    }

    public function getAllClasses()
    {
        return DB::table('tb_classes')
            ->where('status', 'active')
            ->orderBy('class_id', 'asc')
            ->get();
    }

    public function getAllTeachers()
    {
        return DB::table('tb_teachers')
            ->where('status', 'active')
            ->select('teacher_id', DB::raw('CONCAT(first_name, " ", last_name) as name'))
            ->orderBy('first_name', 'asc')
            ->get();
    }
}
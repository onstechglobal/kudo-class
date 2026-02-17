<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;

class AcademicModel
{
    // Make sure this points to the academic years table
    protected string $table = 'tb_academic_years';
	
	public function getAcademicList($perpage = 10, $filters = []) {
		// 1. Start the base query with the Join
		$query = DB::table('tb_academic_years as ay')
			->leftJoin('tb_schools as s', 'ay.school_id', '=', 's.school_id')
			->select('ay.*', 's.school_name');

		// 2. Add Search if it exists
		if (!empty($filters['search'])) {
			$search = $filters['search'];
			$query->where(function($q) use ($search) {
				$q->where('ay.year_name', 'like', '%' . $search . '%')
				  ->orWhere('s.school_name', 'like', '%' . $search . '%');
			});
		}

		// 3. Add Status filter if it exists
		if (isset($filters['status']) && $filters['status'] !== '') {
			$query->where('ay.is_active', $filters['status']);
		}

		// 4. Add Status filter if it exists
		if (isset($filters['start_date']) && $filters['start_date'] !== '') {
			$query->where('ay.start_date', $filters['start_date']);
		}

		// 5. Add Status filter if it exists
		if (isset($filters['end_date']) && $filters['end_date'] !== '') {
			$query->where('ay.end_date', $filters['end_date']);
		}

		// 4. Finalize with Order and Pagination
		return $query->orderBy('ay.start_date', 'desc')->paginate($perpage);
	}
	

	public function getAcademicStats() {
		return [
			'total' => DB::table('tb_academic_years')->count(),
			'active' => DB::table('tb_academic_years')->where('is_active', 1)->count(),
			// Past years: where end_date is before today
			'past' => DB::table('tb_academic_years')->where('end_date', '<', date('Y-m-d'))->count(),
		];
	}

    /* ====== INSERT NEW ACADEMIC YEAR ========= */
    public function insertAcademicYear($data) {

		$startYear = date('Y', strtotime($data['start_date']));
		$endYear   = date('Y', strtotime($data['end_date']));
		$yearName  = $startYear . '-' . $endYear;

        return DB::table($this->table)->insert([
            'academic_year_id' => null, // Auto-increment
            'school_id'        => $data['school_id'],
            'year_name'        => $yearName,
            'start_date'       => $data['start_date'],
            'end_date'         => $data['end_date'],
            // Mapping frontend 'active'/'inactive' to DB '1'/'0'
            'is_active'        => $data['status'] === 'active' ? 1 : 0,
            'created_at'       => now(),
        ]);
    }
	
	public function getById($id) {
		return DB::table($this->table)->where('academic_year_id', $id)->first();
	}

	public function updateYear($id, $data) {
		return DB::table($this->table)
			->where('academic_year_id', $id)
			->update([
				'school_id'  => $data['school_id'],
				'year_name'  => $data['year_name'],
				'start_date' => $data['start_date'],
				'end_date'   => $data['end_date'],
				'is_active'  => $data['status'] === 'active' ? 1 : 0,
			]);
	}
	
	public function deleteAcademicYear($id) {
		// We use the primary key column name from your table
		return DB::table($this->table)
			->where('academic_year_id', $id)
			->delete();
	}
	
}
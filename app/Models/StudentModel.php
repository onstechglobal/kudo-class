<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StudentModel
{
    protected string $table = 'tb_students';
	
	
	/* public function insertStudent($data, $photoName) {
		return DB::table('tb_students')->insertGetId([
			'student_id'         => null,
			'school_id'          =>  12,
			'academic_year_id'   => 2026,
			'admission_no'       => $data['admission_no'],
			'roll_no'            => $data['roll_no'] ?? null,
			'first_name'         => $data['first_name'],
			'last_name'          => $data['last_name'] ?? null,
			'gender'             => $data['gender'],
			'dob'                => $data['dob'],
			'blood_group'        => $data['blood_group'] ?? null,
			'class_id'           => $data['class_id'],
			'section_id'         => $data['section_id'],
			'photo_url'          => $photoName,
			'status'             => $data['status'] ?? 'active',
			'joined_date'        => $data['joined_date'] ?? now()->format('Y-m-d'),
			'left_date'          => null,
			'created_at'         => now(),
			'updated_at'         => now(),
		]);
	} */
	
	
	public function insertStudentWithParent($data, $photoName) {
		return DB::transaction(function () use ($data, $photoName) {
			try {
				// 1. Get the family_id from the selected parent
				$parent = DB::table('tb_parents')
					->where('parent_id', $data['parent_id'])
					->first();

				if (!$parent) {
					return false;
				}

				// 2. Insert into tb_students
				$studentId = DB::table('tb_students')->insertGetId([
					'school_id'        => 12,
					'family_id'        => $parent->family_id, // Link to family
					'academic_year_id' => 2026,
					'admission_no'     => $data['admission_no'],
					'roll_no'          => $data['roll_no'] ?? null,
					'first_name'       => $data['first_name'],
					'last_name'        => $data['last_name'] ?? null,
					'gender'           => $data['gender'],
					'dob'              => $data['dob'],
					'blood_group'      => $data['blood_group'] ?? null,
					'class_id'         => $data['class_id'] ?? null,
					'section_id'       => $data['section_id'] ?? null,
					'photo_url'        => $photoName,
					'status'           => $data['status'] ?? 'active',
					'joined_date'      => $data['joined_date'] ?? now()->format('Y-m-d'),
					'created_at'       => now(),
					'updated_at'       => now(),
				]);

				// 3. Insert into tb_student_parents (The Link Table)
				DB::table('tb_student_parents')->insert([
					'student_id' => $studentId,
					'parent_id'  => $data['parent_id'],
					'relation'   => '', // Default relation
					'is_primary' => 1,
					'created_at' => now()
				]);

				return $studentId;
			} catch (\Exception $e) {
				// Log the error if needed: \Log::error($e->getMessage());
				return false;
			}
		});
	}
	
	
	
	public function fetchStudents($params) {
        // $query = DB::table('tb_students as s')
        //     ->leftJoin('tb_parents as p', 's.family_id', '=', 'p.family_id')
        //     ->select(
        //         's.*',
        //         'p.first_name as parent_first',
        //         'p.last_name as parent_last',
        //         'p.mobile as parent_mobile'
        //     );
 
        $query =    DB::table('tb_students as s')
                ->leftJoin(DB::raw('(
                    SELECT p1.*
                    FROM tb_parents p1
                    INNER JOIN (
                        SELECT family_id, MIN(parent_id) as min_parent_id
                        FROM tb_parents
                        GROUP BY family_id
                    ) p2
                    ON p1.parent_id = p2.min_parent_id
                ) as p'), 's.family_id', '=', 'p.family_id')
                ->select(
                    's.*',
                    'p.first_name as parent_first',
                    'p.last_name as parent_last',
                    'p.mobile as parent_mobile'
                );
 
        // Filter by Search Query (Student Name, Admission No, Parent Name, or City)
        if (!empty($params['search'])) {
            $search = $params['search'];
            $query->where(function($q) use ($search) {
                $q->where('s.first_name', 'LIKE', "%$search%")
                  ->orWhere('s.last_name', 'LIKE', "%$search%")
                  ->orWhere('s.admission_no', 'LIKE', "%$search%")
                  ->orWhere('s.city', 'LIKE', "%$search%")
                  ->orWhere('p.first_name', 'LIKE', "%$search%")
                  ->orWhere('p.last_name', 'LIKE', "%$search%");
            });
        }
 
        // Filter by Status
        if (!empty($params['status'])) {
            $query->where('s.status', $params['status']);
        }
 
        // Return paginated results, ordered by most recent admission
        return $query->orderBy('s.student_id', 'desc')->paginate(10);
    }


    /**
     * Get counts for dashboard statistics cards
     */
    public function getStudentStats() {
        return [
            'active' => DB::table('tb_students')->where('status', 'active')->count(),
            'inactive' => DB::table('tb_students')->where('status', 'inactive')->count(),
        ];
    }


    /**
     * Delete student and clean up join table links
     */
    public function deleteStudentRecord($id) {
        return DB::transaction(function () use ($id) {
            // Remove the link to parents first (foreign key/link safety)
            DB::table('tb_student_parents')->where('student_id', $id)->delete();
            
            // Delete the student profile
            return DB::table('tb_students')->where('student_id', $id)->delete();
        });
    }
	
	
	public function getStudentById($id) {
		return DB::table('tb_students')->where('student_id', $id)->first();
	}

	/* public function updateStudentData($id, $data) {
		return DB::table('tb_students')
			->where('student_id', $id)
			->update($data);
	} */
	
	
	public function updateStudentWithParent($id, $data) {
		return DB::transaction(function () use ($id, $data) {
			try {
				// 1. Find parent to get family_id
				$parent = DB::table('tb_parents')
					->where('parent_id', $data['parent_id'])
					->first();

				if (!$parent) return false;

				// 2. Prepare student data
				$updateData = [
					'school_id'         => $data['school_id'],
					'family_id'         => $parent->family_id,
					'admission_no'      => $data['admission_no'],
					'roll_no'           => $data['roll_no'] ?? null,
					'first_name'        => $data['first_name'],
					'last_name'         => $data['last_name'] ?? null,
					'gender'            => $data['gender'],
					'dob'               => $data['dob'],
					'status'            => $data['status'] ?? 'active',
					'emergency_contact' => $data['emergency_contact'] ?? null,
					'updated_at'        => now(),
				];

				if (isset($data['photo_url'])) {
					$updateData['photo_url'] = $data['photo_url'];
				}

				// 3. Update tb_students
				DB::table('tb_students')->where('student_id', $id)->update($updateData);

				// 4. Update or Insert Parent Link
				// This ensures the link table tb_student_parents is always current
				DB::table('tb_student_parents')->updateOrInsert(
					['student_id' => $id], // Search by student
					[
						'parent_id'  => $data['parent_id'],
						'relation'   => 'Father', 
						'is_primary' => 1,
						'created_at' => now()
					]
				);

				return true;
			} catch (\Exception $e) {
				return false;
			}
		});
	}
	
	
	
	/* public function deleteStudent($id) {
		return DB::table($this->table)->where('student_id', $id)->delete();
	} */
	
	
}

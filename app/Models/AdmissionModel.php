<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;

class AdmissionModel
{
    public function registerNewAdmission($data)
    {
        return DB::transaction(function () use ($data) {
            // 1. Insert into tb_families
            $familyId = DB::table('tb_families')->insertGetId([
                'address_line1' => $data['familyAddress'],
                'city'          => $data['city'] ?? '',
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);

            // 2. Insert Parents (Father & Mother)
            if ($data['relationshipGroup'] === 'Parents') {
                $parents = [
                    [
                        'family_id' => $familyId,
                        'first_name' => $data['fatherName'],
                        'mobile'     => $data['fatherPhone'],
                        'parent_type' => $data['parentType'],
                        'school_id'  => $data['school_id'],
                        'created_at' => now(),
                    ],
                    [
                        'family_id' => $familyId,
                        'first_name' => $data['motherName'],
                        'mobile'     => $data['motherPhone'],
                        'parent_type' => $data['parentType'],
                        'school_id'  => $data['school_id'],
                        'created_at' => now(),
                    ]
                ];
                DB::table('tb_parents')->insert($parents);
            } else {
                // Guardian Logic
                DB::table('tb_parents')->insert([
                    'family_id' => $familyId,
                    'first_name' => $data['guardianName'],
                    'mobile'     => $data['guardianPhone'],
                    'parent_type' => $data['parentType'],
                    'school_id'  => $data['school_id'],
                    'created_at' => now(),
                ]);
            }

            // 3. Insert into tb_students
            $studentId = DB::table('tb_students')->insertGetId([
                'school_id'        => $data['school_id'],
                'family_id'        => $familyId,
                'academic_year_id' => 1,
                'first_name'       => $data['studentName'],
                'gender'           => $data['gender'],
                'dob'              => $data['dob'],
                'class_id'         => $data['studentClass'],
                'status'           => 'active',
                'created_at'       => now(),
            ]);

            // 4. Insert into tb_student_fees (The Ledger)
            $feesToInsert = [];
            
            // Academic Fee Row
            $feesToInsert[] = [
                'student_id'   => $studentId,
                'fee_id'       => 1, // ID for 'Admission/Academic Fee'
                'total_amount' => $data['fees']['baseFee'],
                'discount'     => $data['fees']['discount'],
                'net_amount'   => $data['fees']['baseFee'] - $data['fees']['discount'],
                'status'       => 'pending',
                'created_at'   => now()
            ];

            // Transport Fee Row (Only if applicable)
            if ($data['transportRoute'] > 0) {
                $feesToInsert[] = [
                    'student_id'   => $studentId,
                    'fee_id'       => 2, // ID for 'Transport Fee'
                    'total_amount' => $data['transportRoute'],
                    'discount'     => 0,
                    'net_amount'   => $data['transportRoute'],
                    'status'       => 'pending',
                    'created_at'   => now()
                ];
            }

            DB::table('tb_student_fees')->insert($feesToInsert);

            return $studentId;
        });
    }
}
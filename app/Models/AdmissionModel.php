<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AdmissionModel
{
    public function registerNewAdmission($data)
    {
        return DB::transaction(function () use ($data) {
            // 1. Insert into tb_families
            $familyId = DB::table('tb_families')->insertGetId([
                'address_line1' => $data['address_line1'] ?? '',
                'address_line2' => $data['address_line2'] ?? '',
                'phone_number'  => $data['familyPhone'] ?? '',
                'city'          => $data['city'] ?? '',
                'district'      => $data['district'] ?? '',
                'state'         => $data['state'] ?? '',
                'pincode'       => $data['pincode'] ?? '',
                'country'       => 'India',
                'created_at'    => now(),
            ]);

            // 2. Create User Account for Primary Parent
            $userId = DB::table('tb_users')->insertGetId([
                'username'    => $data['guardian1Email'],
                'school_id'   => $data['school_id'],
                'name'        => $data['guardian1Name'],
                'email'       => $data['guardian1Email'],
                'mobile'      => $data['guardian1Phone'],
                'password'    => Hash::make($data['guardian1Phone']),
                'role_id'     => 4, 
                'status'      => 'active',
                'created_at'  => now(),
            ]);

            // 3. Insert Guardian 1 & 2
            $parents = [
                [
                    'school_id'    => $data['school_id'],
                    'user_id'      => $userId,
                    'family_id'    => $familyId,
                    'first_name'   => $data['guardian1Name'],
                    'relationship' => 'Parent', 
                    'mobile'       => $data['guardian1Phone'],
                    'email'        => $data['guardian1Email'],
                    'is_primary'   => 1,
                    'parent_type'  => $data['parentType'],
                    'status'       => 'active',
                    'created_at'   => now(),
                ]
            ];

            if (!empty($data['guardian2Name'])) {
                $parents[] = [
                    'school_id'    => $data['school_id'],
                    'user_id'      => null,
                    'family_id'    => $familyId,
                    'first_name'   => $data['guardian2Name'],
                    'relationship' => 'Guardian',
                    'mobile'       => $data['guardian2Phone'],
                    'email'        => $data['guardian1Email'],
                    'is_primary'   => 0,
                    'parent_type'  => $data['parentType'],
                    'status'       => 'active',
                    'created_at'   => now(),
                ];
            }
            DB::table('tb_parents')->insert($parents);

            // 4. Insert Student
            $academicYearId = $data['fee_details'][0]['academic_year_id'] ?? 1;
            $studentId = DB::table('tb_students')->insertGetId([
                'school_id'        => $data['school_id'],
                'family_id'        => $familyId,
                'academic_year_id' => $academicYearId, 
                'first_name'       => $data['studentName'],
                'last_name'        => $data['lastName'] ?? '',
                'dob'              => $data['dob'],
                'class_id'         => $data['studentClass'],
                'policy_id'        => $data['policy_id'],
                'status'           => 'active',
                'joined_date'      => now()->format('Y-m-d'),
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);

            // 5. Prepare Fees (Synchronized Column List)
            $feesToInsert = [];
            $classFees = $data['fee_details']; 

            foreach ($classFees as $fee) {
                $unitAmount = (float)$fee['amount'];
                $multiplier = 1;

                if ($fee['frequency'] === 'monthly' && !empty($fee['end_date'])) {
                    $start = Carbon::now()->startOfMonth();
                    $end = Carbon::parse($fee['end_date'])->startOfMonth();
                    $multiplier = max(0, $start->diffInMonths($end) + 1);
                }

                $baseAmount = $unitAmount * $multiplier;
                $discount = 0;
                if (($fee['fee_type'] ?? '') === 'academic') {
                    if ($data['parentType'] === 'Teacher') $discount = $baseAmount * 0.15;
                    elseif ($data['parentType'] === 'Staff') $discount = $baseAmount * 0.10;
                }

                $feesToInsert[] = [
                    'student_id'        => $studentId,
                    'fee_id'            => $fee['fee_id'],
                    'academic_year_id'  => $fee['academic_year_id'] ?? $academicYearId,
                    'fee_type'          => $fee['fee_type'],
                    'base_amount'       => (string)$baseAmount,
                    'discount'          => (string)$discount,
                    'net_amount'        => (string)($baseAmount - $discount),
                    'paid_amount'       => '0.00',
                    'contract_start_date' => now()->format('Y-m-d'),
                    'contract_end_date'   => $fee['end_date'] ?? null,
                    'status'            => 'pending',
                    'created_at'        => now(),
                ];
            }

            // 6. Add Transport Fee (Ensuring key-parity with the fees loop)
            if ((float)$data['transportRoute'] > 0) {
                $feesToInsert[] = [
                    'student_id'        => $studentId,
                    'fee_id'            => null,
                    'academic_year_id'  => $academicYearId,
                    'fee_type'          => 'transport',
                    'base_amount'       => (string)$data['transportRoute'],
                    'discount'          => '0.00',
                    'net_amount'        => (string)$data['transportRoute'],
                    'paid_amount'       => '0.00',
                    'due_day'       => '1',
                    'contract_start_date' => now()->format('Y-m-d'),
                    'contract_end_date'   => $data['fee_details'][0]['end_date'] ?? null,
                    'status'            => 'pending',
                    'created_at'        => now(),
                ];
            }

            DB::table('tb_student_fees')->insert($feesToInsert);
            return $studentId;
        });
    }

    /**
     * Re-added the missing fetch function
     */
    public function getFeesWithAcademicYear($classId, $schoolId) {
        return DB::table('tb_fee_classes')
            ->join('tb_fee_structures', 'tb_fee_classes.fee_id', '=', 'tb_fee_structures.fee_id')
            ->join('tb_academic_years', 'tb_fee_structures.academic_year_id', '=', 'tb_academic_years.academic_year_id')
            ->where('tb_fee_classes.class_id', $classId)
            ->where('tb_fee_structures.school_id', $schoolId)
            ->select(
                'tb_fee_structures.fee_id',
                'tb_fee_structures.fee_name',
                'tb_fee_structures.fee_type',
                'tb_fee_structures.amount',
                'tb_fee_structures.frequency',
                'tb_fee_structures.academic_year_id',
                'tb_academic_years.start_date', 
                'tb_academic_years.end_date', 
                'tb_academic_years.year_name'
            )
            ->get();
    }
}
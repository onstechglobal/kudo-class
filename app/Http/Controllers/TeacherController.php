<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TeacherModel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class TeacherController extends Controller
{
    protected TeacherModel $model;

    public function __construct()
    {
        $this->model = new TeacherModel();
    }

    public function index()
    {
        $teachers = $this->model->getAllTeachers();
        
        // Transform to include full URLs for images
        $teachers->transform(function ($teacher) {
            if ($teacher->photo_url) {
                // Return full URL for images
                $teacher->photo_url = url('uploads/' . $teacher->photo_url);
            }
            return $teacher;
        });
        
        return response()->json($teachers);
    }

    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required',
            'email' => 'required|email',
            'mobile' => 'required|digits:10',
            'teacher_photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048'
        ]);

        return DB::transaction(function () use ($request) {

            $username = 'tr_' . $request->mobile;
            $password = $this->generatePassword();

            $userId = DB::table('tb_users')->insertGetId([
                'username' => $username,
                'name' => $request->first_name,
                'email' => $request->email,
                'mobile' => $request->mobile,
                'password' => Hash::make($password),
                'role_id' => 3,
                'status' => 'active',
                'created_at' => now()
            ]);

            $photoPath = null;
            if ($request->hasFile('teacher_photo')) {
                // Store in public/uploads/teachers directory
                $photoPath = $request->file('teacher_photo')
                    ->store('teachers', 'uploads'); // Using 'uploads' disk
            }

            $teacherData = $request->all();
            $teacherData['photo'] = $photoPath;

            $this->model->create($teacherData, $userId);

            return response()->json([
                'status' => 200,
                'message' => 'Teacher added successfully',
                'username' => $username,
                'password' => $password
            ]);
        });
    }

    private function generatePassword($length = 10)
    {
        $chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$!";
        return collect(range(1, $length))
            ->map(fn () => $chars[random_int(0, strlen($chars) - 1)])
            ->implode('');
    }

    public function show($id)
    {
        try {
            $teacher = DB::table('tb_teachers')->where('teacher_id', $id)->first();
            if (!$teacher) {
                return response()->json(['message' => 'Teacher not found'], 404);
            }
            
            // Transform to include full URL for image
            if ($teacher->photo_url) {
                $teacher->photo_url = url('uploads/' . $teacher->photo_url);
            }
            
            return response()->json(['teacher' => $teacher]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'first_name' => 'required',
            'email' => 'required|email',
            'mobile' => 'required|digits:10',
            'teacher_photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048'
        ]);

        try {
            return DB::transaction(function () use ($request, $id) {
                $teacher = DB::table('tb_teachers')->where('teacher_id', $id)->first();
                if (!$teacher) {
                    return response()->json(['message' => 'Teacher not found'], 404);
                }

                $photoPath = $teacher->photo_url;
                if ($request->hasFile('teacher_photo')) {
                    // Store in public/uploads/teachers directory
                    $photoPath = $request->file('teacher_photo')->store('teachers', 'uploads');
                }

                DB::table('tb_teachers')->where('teacher_id', $id)->update([
                    'first_name' => $request->first_name,
                    'last_name' => $request->last_name,
                    'email' => $request->email,
                    'mobile' => $request->mobile,
                    'designation' => $request->designation,
                    'joining_date' => $request->joining_date,
                    'qualification' => $request->qualification,
                    'experience_years' => $request->experience_years,
                    'status' => $request->status,
                    'photo_url' => $photoPath,
                    'updated_at' => now()
                ]);

                return response()->json(['status' => 200, 'message' => 'Teacher updated successfully']);
            });
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        DB::table('tb_teachers')->where('teacher_id', $id)->delete();
        return response()->json(['status' => 200, 'message' => 'Teacher deleted']);
    }
}
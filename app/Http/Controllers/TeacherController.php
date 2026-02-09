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
        // return response()->json($teachers);
		
		echo '<pre> --- '; print_r($teachers->toArray()); die;
		
    }
	

    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required',
            'email' => 'required|email',
            'username' => 'required|unique:tb_users,username',
            'password' => 'required|min:6',
            'mobile' => 'required|digits:10',
            'teacher_photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048'
        ]);

        return DB::transaction(function () use ($request) {

            //$username = 'tr_' . $request->mobile;
            //$password = $this->generatePassword();

            $username = $request->username ?? ('tr_' . $request->mobile);
            $password = $request->password ?? $this->generatePassword();

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

    public function show($id)
    {
        $teacher = $this->model->getTeacherById($id);
        if(!$teacher){
            return response()->json(['message'=>'Teacher not found'], 404);
        }
        return response()->json(['teacher'=>$teacher]);
    }

    public function update(Request $request, $id)
    {
        $teacher = $this->model->getTeacherById($id);
        if(!$teacher){
            return response()->json(['message'=>'Teacher not found'], 404);
        }

        $request->validate([
            'first_name' => 'required',
            'email' => 'required|email',
            'mobile' => 'required|digits:10',
            'username' => 'required|unique:tb_users,username,' . $teacher->user_id . ',user_id',
            'password' => 'nullable|min:6',
            'teacher_photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048'
        ]);

        try {
            return DB::transaction(function() use($request, $id){
                $photoPath = null;
                if($request->hasFile('teacher_photo')){
                    $photoPath = $request->file('teacher_photo')->store('teachers','uploads');
                } elseif ($request->input('keep_original_photo')) {
                    $photoPath = null; // will keep original in model
                }

                $data = $request->all();
                if($photoPath) $data['teacher_photo'] = $photoPath;

                $this->model->updateTeacher($id, $data);

                return response()->json([
                    'status' => 200,
                    'message' => 'Teacher updated successfully'
                ]);
            });
        } catch(\Exception $e){
            return response()->json(['message'=>'Server error','error'=>$e->getMessage()],500);
        }
    }

    public function destroy($id)
    {
        $this->model->deleteTeacher($id);
        return response()->json(['status'=>200,'message'=>'Teacher deleted']);
    }

}
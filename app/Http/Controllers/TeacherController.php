<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\TeacherModel;

class TeacherController extends Controller
{
    protected TeacherModel $model;

    public function __construct()
    {
        $this->model = new TeacherModel();
    }

    public function index()
    {
        return response()->json($this->model->getAllTeachers());
    }
}

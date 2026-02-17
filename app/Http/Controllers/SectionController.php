<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SectionModel;

class SectionController extends Controller
{
    protected SectionModel $model;

    public function __construct()
    {
        $this->model = new SectionModel();
    }

   public function index(Request $request){
		$schoolId = $request->query('school_id');

		$filter = [
			'search'  => $request->query('search'),
			'status'  => $request->query('status'),
			'class'   => $request->query('class'),
			'teacher' => $request->query('teacher'),
		];

		// Pass the schoolId along with the filters
		$sections = $this->model->getAllSections($schoolId, $filter);
		
		return response()->json($sections);
	}
	

    public function store(Request $request)
    {
        $request->validate([
            'class_id' => 'required|exists:tb_classes,class_id',
            'section_name' => 'required|string|max:100',
            'class_teacher_id' => 'nullable|exists:tb_teachers,teacher_id',
            'status' => 'required|in:active,inactive'
        ]);

        try {
            $this->model->create($request->all());
            return response()->json(['status' => 200, 'message' => 'Section added successfully']);
        } catch (\Exception $e) {
            return response()->json(['status' => 500, 'message' => 'Failed to add section', 'error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        try {
            $section = $this->model->getById($id);

            if (!$section) {
                return response()->json(['message' => 'Section not found'], 404);
            }

            return response()->json(['section' => $section]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Server error', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'class_id' => 'required|exists:tb_classes,class_id',
            'section_name' => 'required|string|max:50',
            'class_teacher_id' => 'nullable|exists:tb_teachers,teacher_id',
            'status' => 'required|in:active,inactive'
        ]);

        try {
            $section = $this->model->getById($id);
            if (!$section) {
                return response()->json(['message' => 'Section not found'], 404);
            }

            $this->model->updateSection($id, $request->all());

            return response()->json(['status' => 200, 'message' => 'Section updated successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update section', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $section = $this->model->getById($id);
            if (!$section) {
                return response()->json(['message' => 'Section not found'], 404);
            }

            $this->model->deleteSection($id);

            return response()->json(['status' => 200, 'message' => 'Section deleted']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete section', 'error' => $e->getMessage()], 500);
        }
    }
}
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PermissionModel;

class PermissionController extends Controller{
    protected PermissionModel $model;

    public function __construct(){
        $this->model = new PermissionModel();
    }

    public function index(){
        return response()->json($this->model->all());
    }

    public function store(Request $request){
        $request->validate([
            'module' => 'required|string|max:255',
            'status' => 'required|in:active,inactive',
        ]);

        $this->model->create([
            'module' => $request->module,
            'status' => $request->status,
        ]);

        return response()->json(['message' => 'Permission created']);
    }

    public function show($id){
        return response()->json(
            $this->model->find($id)
        );
    }

    public function update(Request $request, $id){
        $request->validate([
            'module' => 'required|string|max:255',
            'status' => 'required|in:active,inactive',
        ]);

        $this->model->update($id, [
            'module' => $request->module,
            'status' => $request->status,
        ]);

        return response()->json(['message' => 'Permission updated']);
    }

    public function destroy($id){
        $this->model->delete($id);
        return response()->json(['message' => 'Permission deleted']);
    }
}

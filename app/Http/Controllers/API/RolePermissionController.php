<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RolePermissionModel;

class RolePermissionController extends Controller
{
    protected RolePermissionModel $model;

    public function __construct()
    {
        $this->model = new RolePermissionModel();
    }

    public function index()
    {
        return response()->json($this->model->all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'role_id'       => 'required|integer',
            'permission_id' => 'required|integer',
        ]);

        $this->model->create([
            'role_id'       => $request->role_id,
            'permission_id' => $request->permission_id,
            'status'        => $request->status ?? 'active',
        ]);

        return response()->json(['message' => 'Role permission added']);
    }

    public function show($id)
    {
        return response()->json($this->model->find($id));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'role_id'       => 'required|integer',
            'permission_id' => 'required|integer',
        ]);

        $this->model->update($id, [
            'role_id'       => $request->role_id,
            'permission_id' => $request->permission_id,
            'status'        => $request->status,
        ]);

        return response()->json(['message' => 'Role permission updated']);
    }

    public function destroy($id)
    {
        $this->model->delete($id);
        return response()->json(['message' => 'Role permission deleted']);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\RoleModel;
use Illuminate\Http\Request;

class RoleController extends Controller
{
    protected RoleModel $model;

    public function __construct()
    {
        $this->model = new RoleModel();
    }

    /* ========= GET ALL ROLES ========= */
    public function index()
    {
        return response()->json(
            $this->model->getAllRolesWithPermissions()
        );
    }

    /* ========= CREATE ROLE ========= */
    public function store(Request $request)
    {
        $request->validate([
            'role_name'   => 'required',
            'permissions' => 'array'
        ]);

        if ($this->model->roleNameExists($request->role_name)) {
            return response()->json([
                'message' => 'Role already exists'
            ], 422);
        }

        $this->model->createRoleWithPermissions(
            $request->only(['role_name', 'status']),
            $request->permissions ?? []
        );

        return response()->json([
            'message' => 'Role created'
        ]);
    }

    /* ========= SHOW ROLE ========= */
    public function show($id){
        $data = $this->model->getRoleWithPermissions($id);

        if (!$data) {
            return response()->json(['message' => 'Role not found'], 404);
        }

        return response()->json($data);
    }


    /* ========= UPDATE ROLE ========= */
    public function update(Request $request, $id){
        $request->validate([
            'role_name'   => 'required',
            'permissions' => 'array'
        ]);

        if ($this->model->roleNameExists($request->role_name, $id)) {
            return response()->json(['message' => 'Role already exists'], 422);
        }

        $this->model->updateRoleWithPermissions(
            $id,
            $request->only(['role_name', 'status']),
            $request->permissions ?? []
        );

        return response()->json(['message' => 'Role updated']);
    }


    /* ========= DELETE ROLE ========= */
    public function destroy($id)
    {
        $this->model->deleteRole($id);

        return response()->json(['message' => 'Role deleted']);
    }
}

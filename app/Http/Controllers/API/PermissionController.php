<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\RolePermission;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    /* ALL PERMISSIONS */
    public function index()
    {
        return Permission::where('status', 'active')
            ->orderBy('permission_id')
            ->get();
    }

    /* GET ROLE PERMISSIONS */
    public function rolePermissions($roleId)
    {
        $permissions = Permission::where('status', 'active')->get();

        $assigned = RolePermission::where('role_id', $roleId)
            ->where('status', 'active')
            ->pluck('permission_id')
            ->toArray();

        return [
            'permissions' => $permissions,
            'assigned' => $assigned
        ];
    }

    /* UPDATE ROLE PERMISSIONS */
    public function updateRolePermissions(Request $request, $roleId)
    {
        $permissionIds = $request->permission_ids ?? [];

        /* REMOVE OLD */
        RolePermission::where('role_id', $roleId)->delete();

        /* INSERT NEW */
        foreach ($permissionIds as $pid) {
            RolePermission::create([
                'role_id' => $roleId,
                'permission_id' => $pid,
                'status' => 'active'
            ]);
        }

        return response()->json([
            'message' => 'Permissions updated successfully'
        ]);
    }
}

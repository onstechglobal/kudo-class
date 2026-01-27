<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;

class RoleModel
{
    protected string $table = 'tb_roles';

    /* ========= GET ALL ROLES ========= */
    /* ========= GET ALL ROLES WITH PERMISSIONS ========= */
    public function getAllRolesWithPermissions()
    {
        $roles = DB::table('tb_roles')
            ->orderBy('role_id', 'desc')
            ->get();

        $roleIds = $roles->pluck('role_id');

        $permissions = DB::table('tb_role_permissions as rp')
            ->join('tb_permissions as p', 'p.permission_id', '=', 'rp.permission_id')
            ->whereIn('rp.role_id', $roleIds)
            ->select(
                'rp.role_id',
                'p.module',
                'p.action'
            )
            ->get()
            ->groupBy('role_id');

        // attach permissions to role
        return $roles->map(function ($role) use ($permissions) {
            $role->permissions = $permissions[$role->role_id] ?? collect();
            return $role;
        });
    }


    /* ========= GET ROLE BY ID ========= */
    public function getRoleById(int $id){
        return DB::table($this->table)
            ->where('role_id', $id)
            ->first();
    }

    /* ========= CREATE ROLE + PERMISSIONS ========= */
    public function createRoleWithPermissions(array $roleData, array $permissionIds){
        return DB::transaction(function () use ($roleData, $permissionIds) {

            $roleId = DB::table($this->table)->insertGetId([
                'role_name' => $roleData['role_name'],
                'status'    => $roleData['status'] ?? 'active',
            ]);

            if (!empty($permissionIds)) {
                $this->attachPermissions($roleId, $permissionIds);
            }

            return $roleId;
        });
    }

    /* ========= UPDATE ROLE ========= */
    public function updateRoleWithPermissions(int $id, array $data, array $permissionIds = []){
        return DB::transaction(function () use ($id, $data, $permissionIds) {

            DB::table($this->table)
                ->where('role_id', $id)
                ->update([
                    'role_name' => $data['role_name'],
                    'status'    => $data['status'] ?? 'active',
                ]);

            $this->syncPermissions($id, $permissionIds);

            return true;
        });
    }       


    /* ========= DELETE ROLE ========= */
    public function deleteRole(int $id){
        DB::table('tb_role_permissions')
            ->where('role_id', $id)
            ->delete();

        return DB::table($this->table)
            ->where('role_id', $id)
            ->delete();
    }

    /* ========= CHECK ROLE NAME UNIQUE ========= */
    public function roleNameExists(string $name, ?int $ignoreId = null){
        $query = DB::table($this->table)
            ->where('role_name', $name);

        if ($ignoreId) {
            $query->where('role_id', '!=', $ignoreId);
        }

        return $query->exists();
    }

    /* ========= ATTACH PERMISSIONS ========= */
    public function attachPermissions(int $roleId, array $permissionIds){
        foreach ($permissionIds as $pid) {
            DB::table('tb_role_permissions')->insert([
                'role_id'       => $roleId,
                'permission_id' => $pid,
                'status'        => 'active',
            ]);
        }
    }

    public function getRoleWithPermissions(int $id){
        $role = DB::table('tb_roles')
            ->where('role_id', $id)
            ->first();

        if (!$role) {
            return null;
        }

        $permissions = DB::table('tb_role_permissions as rp')
            ->join('tb_permissions as p', 'p.permission_id', '=', 'rp.permission_id')
            ->where('rp.role_id', $id)
            ->select('p.permission_id', 'p.module', 'p.action')
            ->get();

        return [
            'role' => $role,
            'permissions' => $permissions
        ];
    }

    public function syncPermissions(int $roleId, array $permissionIds){
        DB::table('tb_role_permissions')
            ->where('role_id', $roleId)
            ->delete();

        foreach ($permissionIds as $pid) {
            DB::table('tb_role_permissions')->insert([
                'role_id'       => $roleId,
                'permission_id' => $pid,
                'status'        => 'active'
            ]);
        }
    }
}

<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;

class RoleModel
{
    protected string $table = 'tb_roles';

    /* ========= GET ALL ROLES ========= */
    /* ========= GET ALL ROLES WITH PERMISSIONS ========= */
    public function getAllRolesWithPermissions($filters=[])
    {
        $roles = DB::table('tb_roles')
			->when(!empty($filters['search']), function ($query) use ($filters) {
				$query->where(function($q) use ($filters) {
					$q->where('role_name', 'like', '%' . $filters['search'] . '%');
				});
			})
			->when(!empty($filters['status']), function ($query) use ($filters) {
				$query->where(function($q) use ($filters) {
					$q->where('status', $filters['status']);
				});
			})
            ->orderBy('role_id', 'desc')
            ->get();
		// echo "<pre>"; print_R($roles); die;
        $roleIds = $roles->pluck('role_id');

        $permissions = DB::table('tb_role_permissions as rp')
            ->join('tb_permissions as p', 'p.permission_id', '=', 'rp.permission_id')
            ->whereIn('rp.role_id', $roleIds)
			->when(!empty($filters['permission_id']), function ($query) use ($filters) {
				$query->where(function($q) use ($filters) {
					$q->where('rp.permission_id', $filters['permission_id']);
				});
			})
            ->select(
                'rp.role_id',
                'rp.permission_id',
                'p.module',
                'p.action'
            )
            ->get()
            ->groupBy('role_id');
			
        // attach permissions to role
		if(isset($filters['permission_id']) && !empty($filters['permission_id'])){
			$data = $roles->filter(function ($role) use ($permissions) {
				return isset($permissions[$role->role_id]) && !empty($permissions[$role->role_id]);
				
			})->map(function ($role) use ($permissions) {
				$role->permissions = $permissions[$role->role_id] ?? collect();
				return $role;
				
			})->values();
		}else{
			$data = $roles->map(function ($role) use ($permissions) {
				$role->permissions = $permissions[$role->role_id] ?? collect();
				return $role;
			});
		}
		return $data;
		
        /* return $roles->map(function ($role) use ($permissions) {
			
			$role->permissions = $permissions[$role->role_id] ?? collect();
			
			if(isset($filters['permission_id']) && !empty($filters['permission_id'])){
				echo "test1 <br>";
				if(isset($permissions[$role->role_id]) && !empty($permissions[$role->role_id])){
				echo "test2 <br>";
					return $role;
				}
			}else{
				echo "test3 <br>";
				return $role;
			}
        }); */
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

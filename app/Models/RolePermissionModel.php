<?php

namespace App\Models;

use Illuminate\Support\Facades\DB;

class RolePermissionModel
{
    protected $table = 'tb_role_permissions';

    /* GET ALL ROLE PERMISSIONS */
    public function all()
    {
        return DB::table('tb_role_permissions as rp')
            ->join('tb_roles as r', 'r.role_id', '=', 'rp.role_id')
            ->join('tb_permissions as p', 'p.permission_id', '=', 'rp.permission_id')
            ->select(
                'rp.id',
                'rp.role_id',
                'r.role_name',
                'rp.permission_id',
                'p.module',
                'p.action',
                'rp.status'
            )
            ->orderBy('rp.id', 'desc')
            ->get();
    }

    /* INSERT */
    public function create($data)
    {
        return DB::table('tb_role_permissions')->insert($data);
    }

    /* GET BY ID */
    public function find($id)
    {
        return DB::table('tb_role_permissions')->where('id', $id)->first();
    }

    /* UPDATE */
    public function update($id, $data)
    {
        return DB::table('tb_role_permissions')
            ->where('id', $id)
            ->update($data);
    }

    /* DELETE */
    public function delete($id)
    {
        return DB::table('tb_role_permissions')
            ->where('id', $id)
            ->delete();
    }
}

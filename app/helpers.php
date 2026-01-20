<?php

use App\Models\RolePermission;

function hasPermission($roleId, $permission)
{
    return RolePermission::join(
        'tb_permissions',
        'tb_permissions.permission_id',
        '=',
        'tb_role_permissions.permission_id'
    )
        ->where('tb_role_permissions.role_id', $roleId)
        ->where('tb_permissions.module', $permission)
        ->where('tb_role_permissions.status', 'active')
        ->exists();
}

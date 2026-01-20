<?php
namespace App\Models;
use Illuminate\Support\Facades\DB;

class PermissionModel{
    protected string $table = 'tb_permissions';

    public function all(){
        return DB::table($this->table)
            ->orderBy('permission_id', 'desc')
            ->get();
    }

    public function find(int $id){
        return DB::table($this->table)
            ->where('permission_id', $id)
            ->first();
    }

    public function create(array $data){
        return DB::table($this->table)->insert($data);
    }

    public function update(int $id, array $data){
        return DB::table($this->table)
            ->where('permission_id', $id)
            ->update($data);
    }

    public function delete(int $id){
        return DB::table($this->table)
            ->where('permission_id', $id)
            ->delete();
    }
}


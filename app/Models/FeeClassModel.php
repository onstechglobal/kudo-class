<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeeClassModel extends Model
{
    protected $table = 'tb_fee_classes';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'fee_id',
        'class_id',
    ];

    public function feeStructure()
    {
        return $this->belongsTo(FeeStructureModel::class, 'fee_id', 'fee_id');
    }

    public function classDetail()
    {
        return $this->belongsTo(ClassModel::class, 'class_id', 'id');
    }
}
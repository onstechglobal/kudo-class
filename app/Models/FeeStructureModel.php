<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FeeStructureModel extends Model
{
    use HasFactory;

    protected $table = 'tb_fee_structures';
    protected $primaryKey = 'fee_id';
    public $timestamps = true;

    protected $fillable = [
        'school_id',
        'academic_year_id',
        'fee_name',
        'amount',
        'fee_type',
        'frequency',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'created_at' => 'datetime',
    ];

    // Relationship with classes through tb_fee_classes pivot table
    public function classes()
    {
        return $this->belongsToMany(
            ClassModel::class, 
            'tb_fee_classes',  // Correct pivot table name
            'fee_id',          // Foreign key on the pivot table
            'class_id',        // Other foreign key on the pivot table
            'fee_id',          // Local key on the fee_structures table
            'class_id'         // Local key on the classes table (tb_classes.id)
        )->withTimestamps();
    }

    // Remove the academicYear relationship since AcademicModel is not an Eloquent model
    // public function academicYear()
    // {
    //     return $this->belongsTo(AcademicModel::class, 'academic_year_id', 'academic_year_id');
    // }

    // Alias for classes relationship
    public function feeClasses()
    {
        return $this->classes();
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiscountModel extends Model
{
    protected $table = 'tb_discounts';
    protected $primaryKey = 'discount_id';
    public $timestamps = true;

    protected $fillable = [
        'school_id',
        'parent_type',
        'discount_type',
        'discount_value',
        'applies_to_fee_type',
        'status',
    ];

    protected $casts = [
        'discount_value' => 'float',
    ];

    /* =========================
       MODEL QUERY METHODS
    ========================== */

    // Get all discounts (school wise)
    public static function getAllDiscounts($school_id)
    {
        return self::where('school_id', $school_id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    // Create discount
    public static function createDiscount(array $data)
    {
        return self::create($data);
    }

    // Get discount by ID
    public static function getDiscountById($id)
    {
        return self::find($id);
    }

    // Check duplicate (school wise)
    public static function existsByParentAndFee($school_id, $parentType, $feeType, $excludeId = null)
    {
        $query = self::where('school_id', $school_id)
            ->where('parent_type', $parentType)
            ->where('applies_to_fee_type', $feeType);

        if ($excludeId) {
            $query->where('discount_id', '!=', $excludeId);
        }

        return $query->exists();
    }

    // Update discount
    public function updateDiscount(array $data)
    {
        return $this->update($data);
    }

    // Delete discount
    public function deleteDiscount()
    {
        return $this->delete();
    }
}

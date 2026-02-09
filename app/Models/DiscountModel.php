<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiscountModel extends Model{
    protected $table = 'tb_discounts';
    protected $primaryKey = 'discount_id';

    protected $fillable = [
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

    // Get all discounts
    public static function getAllDiscounts(){
        return self::orderBy('created_at', 'desc')->get();
    }

    // Create discount
    public static function createDiscount(array $data){
        return self::create($data);
    }

    // Get discount by ID
    public static function getDiscountById($id){
        return self::where('discount_id', $id)->first();
    }

    public static function existsByParentAndFee($parentType, $feeType, $excludeId = null){
        $query = self::where('parent_type', $parentType)
            ->where('applies_to_fee_type', $feeType);

        // used during update (ignore current record)
        if ($excludeId) {
            $query->where('discount_id', '!=', $excludeId);
        }

        return $query->exists();
    }

    // Update discount
    public function updateDiscount(array $data){
        return $this->update($data);
    }

    // Delete discount
    public function deleteDiscount(){
        return $this->delete();
    }
    
}

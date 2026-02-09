<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DiscountModel;
use Illuminate\Support\Facades\Validator;

class DiscountController extends Controller{
    /**
     * List discounts
     */
    public function index(){
        $discounts = DiscountModel::getAllDiscounts();

        return response()->json([
            'success' => true,
            'data' => $discounts
        ]);
    }

    /**
     * Store discount
     */
    public function store(Request $request){
        $validator = Validator::make($request->all(), [
            'parent_type' => 'required|string|max:50',
            'discount_type' => 'required|in:percentage,flat',
            'discount_value' => 'required|numeric|min:0',
            'applies_to_fee_type' => 'required|string|max:50',
            'status' => 'required|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        if (DiscountModel::existsByParentAndFee(
            $request->parent_type,
            $request->applies_to_fee_type
        )) {
            return response()->json([
                'success' => false,
                'message' => 'Discount already exists for this parent type and fee type.'
            ], 409);
        }

        $discount = DiscountModel::createDiscount($request->only([
            'parent_type',
            'discount_type',
            'discount_value',
            'applies_to_fee_type',
            'status',
        ]));

        return response()->json([
            'success' => true,
            'data' => $discount,
            'message' => 'Discount created successfully'
        ]);
    }

    /**
     * Show single discount
     */
    public function show($id){
        $discount = DiscountModel::getDiscountById($id);

        if (!$discount) {
            return response()->json([
                'success' => false,
                'message' => 'Discount not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $discount
        ]);
    }

    /**
     * Update discount
     */
    public function update(Request $request, $id){
        $discount = DiscountModel::getDiscountById($id);

        if (!$discount) {
            return response()->json([
                'success' => false,
                'message' => 'Discount not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'parent_type' => 'required|string|max:50',
            'discount_type' => 'required|in:percentage,flat',
            'discount_value' => 'required|numeric|min:0',
            'applies_to_fee_type' => 'required|string|max:50',
            'status' => 'required|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        if (DiscountModel::existsByParentAndFee(
            $request->parent_type,
            $request->applies_to_fee_type,
            $id // ignore current record
        )) {
            return response()->json([
                'success' => false,
                'message' => 'Another discount already exists for this parent type and fee type.'
            ], 409);
        }
        
        $discount->updateDiscount($request->only([
            'parent_type',
            'discount_type',
            'discount_value',
            'applies_to_fee_type',
            'status',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Discount updated successfully'
        ]);
    }

    /**
     * Delete discount
     */
    public function destroy($id){
        $discount = DiscountModel::getDiscountById($id);

        if (!$discount) {
            return response()->json([
                'success' => false,
                'message' => 'Discount not found'
            ], 404);
        }

        $discount->deleteDiscount();

        return response()->json([
            'success' => true,
            'message' => 'Discount deleted successfully'
        ]);
    }
}

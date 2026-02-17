<?php

namespace App\Http\Controllers;

use App\Models\PenaltyRuleModel;
use Illuminate\Http\Request;

class PenaltyRuleController extends Controller
{
    // 🔹 Get All
    public function index(Request $request){
        $schoolId = $request->school_id ?? 1;

        $rules = PenaltyRuleModel::where('school_id', $schoolId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => true,
            'data' => $rules
        ]);
    }


    // 🔹 Store
    public function store(Request $request){

        $request->validate([
            'policy_id' => 'required|integer',
            'school_id' => 'required|integer',
            'fee_type' => 'required|in:academic,transport,exam,all',
            'penalty_type' => 'required|in:flat,percentage',
            'penalty_value' => 'required|string',
            'grace_period_days' => 'required|integer|min:1',
            'frequency' => 'required|in:once,per_month',
            'status' => 'required|in:active,inactive'
        ]);

        $rule = PenaltyRuleModel::create([
            'policy_id' => $request->policy_id,
            'school_id' => $request->school_id,
            'fee_type' => $request->fee_type,
            'penalty_type' => $request->penalty_type,
            'penalty_value' => $request->penalty_value,
            'grace_period_days' => $request->grace_period_days,
            'frequency' => $request->frequency,
            'status' => $request->status,
            'created_at' => now()
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Penalty Rule Created Successfully',
            'data' => $rule
        ]);
    }



    // 🔹 Get Single
    public function show($id){
        $rule = PenaltyRuleModel::find($id);

        if (!$rule) {
            return response()->json([
                'status' => false,
                'message' => 'Rule Not Found'
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $rule
        ]);
    }


    // 🔹 Update
    public function update(Request $request, $id){
        $rule = PenaltyRuleModel::find($id);

        if (!$rule) {
            return response()->json([
                'status' => false,
                'message' => 'Rule Not Found'
            ], 404);
        }

        $request->validate([
            'policy_id' => 'required|integer',
            'school_id' => 'required|integer',
            'fee_type' => 'required|in:academic,transport,exam,all',
            'penalty_type' => 'required|in:flat,percentage',
            'penalty_value' => 'required|string',
            'grace_period_days' => 'required|integer|min:1',
            'frequency' => 'required|in:once,per_month',
            'status' => 'required|in:active,inactive'
        ]);

        $rule->update($request->only([
            'policy_id',
            'school_id',
            'fee_type',
            'penalty_type',
            'penalty_value',
            'grace_period_days',
            'frequency',
            'status'
        ]));

        return response()->json([
            'status' => true,
            'message' => 'Penalty Rule Updated Successfully',
            'data' => $rule
        ]);
    }

    // 🔹 Delete
    public function destroy($id)
    {
        $rule = PenaltyRuleModel::find($id);

        if (!$rule) {
            return response()->json([
                'status' => false,
                'message' => 'Rule Not Found'
            ], 404);
        }

        $rule->delete();

        return response()->json([
            'status' => true,
            'message' => 'Penalty Rule Deleted Successfully'
        ]);
    }

}

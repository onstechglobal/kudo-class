<?php

namespace App\Http\Controllers;

use App\Http\Controllers\FeesPolicyController;
use App\Models\FeesPolicyModel;
use Illuminate\Http\Request;

class FeesPolicyController extends Controller
{
    public function index(Request $request){
        $schoolId = $request->school_id ?? 1;

        $query = FeesPolicyModel::where('school_id', $schoolId);

        if ($request->filled('search')) {
            $query->where('policy_name', 'like', '%' . $request->search . '%');
        }

        $policies = $query->orderBy('policy_id', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $policies
        ]);
    }

    public function store(Request $request){
        $request->validate([
            'school_id' => 'required|integer',
            'policy_name' => 'required|string|max:100',
            'reminder_enabled' => 'required|boolean',
            'reminder_frequency_days' => 'nullable|integer|min:0',
            'block_after_months' => 'nullable|integer|min:0',
            'status' => 'required|in:active,inactive',
        ]);

        $policy = FeesPolicyModel::create([
            'school_id' => $request->school_id,
            'policy_name' => $request->policy_name,
            'reminder_enabled' => $request->reminder_enabled,
            'reminder_frequency_days' => $request->reminder_frequency_days,
            'block_after_months' => $request->block_after_months,
            'status' => $request->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Policy created successfully',
            'data' => $policy
        ]);
    }

	
	// GET: /api/fees-policy/{id}
	public function show($id)
	{
		$policy = FeesPolicyModel::findOrFail($id);
		return response()->json(['success' => true, 'data' => $policy]);
	}

	// PUT: /api/fees-policy/{id}
	public function update(Request $request, $id){
        $policy = FeesPolicyModel::findOrFail($id);

        $request->validate([
            'school_id' => 'required|integer',
            'policy_name' => 'required|string|max:100',
            'reminder_enabled' => 'required|boolean',
            'reminder_frequency_days' => 'nullable|integer|min:0',
            'block_after_months' => 'nullable|integer|min:0',
            'status' => 'required|in:active,inactive',
        ]);

        $policy->update([
            'school_id' => $request->school_id,
            'policy_name' => $request->policy_name,
            'reminder_enabled' => $request->reminder_enabled,
            'reminder_frequency_days' => $request->reminder_frequency_days,
            'block_after_months' => $request->block_after_months,
            'status' => $request->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Policy updated successfully',
            'data' => $policy
        ]);
    }

	
    // DELETE: /api/fees-policy/{id}
    public function destroy($id)
    {
        $policy = FeesPolicyModel::findOrFail($id);
        $policy->delete();

        return response()->json([
            'success' => true,
            'message' => 'Policy deleted successfully'
        ]);
    }
}
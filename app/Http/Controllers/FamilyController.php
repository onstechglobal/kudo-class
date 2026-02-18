<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\FamilyModel;

class FamilyController extends Controller
{
    protected $familyModel;

    public function __construct(FamilyModel $familyModel)
    {
        $this->familyModel = $familyModel;
    }

    public function index(Request $request){
        try {
            $families = $this->familyModel->getFamilies($request->all());

            return response()->json([
                'status' => 200,
                'data' => $families->items(),
                'meta' => [
                    'current_page' => $families->currentPage(),
                    'last_page' => $families->lastPage(),
                    'per_page' => $families->perPage(),
                    'total' => $families->total()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => $e->getMessage()
            ]);
        }
    }
	
	
	public function getById($id) {
		try {
			$family = $this->familyModel->getFamilyById($id);
			if ($family) {
				return response()->json(['status' => 200, 'data' => $family]);
			}
			return response()->json(['status' => 404, 'message' => 'Family not found']);
		} catch (\Exception $e) {
			return response()->json(['status' => 500, 'message' => $e->getMessage()]);
		}
	}


	public function update(Request $request) {
		$request->validate([
			'id' => 'required',
			'address_line1' => 'required|string|max:255',
			'phone_number' => 'required|string|max:20',
			'city' => 'required|string',
			'pincode' => 'required|string|max:10',
		]);

		try {
			$id = $request->input('id');
			// Filter out fields we don't want to update manually or that come from the form
			$updateData = $request->only([
				'address_line1', 'address_line2', 'phone_number', 
				'city', 'district', 'state', 'pincode', 'country', 'status'
			]);

			$this->familyModel->updateFamily($id, $updateData);

			return response()->json([
				'status' => 200,
				'message' => 'Family updated successfully'
			]);
		} catch (\Exception $e) {
			return response()->json(['status' => 500, 'message' => $e->getMessage()]);
		}
	}


    public function delete(Request $request) {
        try {
            $id = $request->input('id');
            if (!$id) {
                return response()->json(['status' => 400, 'message' => 'ID is required']);
            }

            $deleted = $this->familyModel->deleteFamily($id);

            if ($deleted) {
                return response()->json([
                    'status' => 200,
                    'message' => 'Family deleted successfully'
                ]);
            }

            return response()->json(['status' => 404, 'message' => 'Family not found']);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => $e->getMessage()
            ]);
        }
    }
}
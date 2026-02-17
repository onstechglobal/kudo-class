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

    public function index(Request $request)
    {
        try {
            $families = $this->familyModel->getFamilies($request->all());
            return response()->json([
                'status' => 200,
                'data' => $families
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 500,
                'message' => $e->getMessage()
            ]);
        }
    }
}
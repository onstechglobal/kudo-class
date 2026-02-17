<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TransportRouteModel;
use Illuminate\Support\Facades\Validator;

class TransportRouteController extends Controller
{
    // =========================================
    // GET ALL ROUTES
    // =========================================
    public function index(Request $request)
    {
        try {
            $school_id = $request->query('schoolId');

            if (!$school_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'School ID is required'
                ], 400);
            }

            $routes = TransportRouteModel::getRoutes(
                $school_id,
                $request->search,
                $request->status
            );

            return response()->json([
                'success' => true,
                'data' => $routes,
                'message' => 'Transport routes fetched successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch transport routes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // =========================================
    // STORE
    // =========================================
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'school_id'    => 'required|integer',
            'route_name'   => 'required|string|max:150',
            'monthly_fee'  => 'required|numeric|min:0',
            'academic_year'=> 'required|string|max:20',
            'driver_name'  => 'nullable|string|max:100',
            'status'       => 'required|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        $route = TransportRouteModel::createRoute($request->all());

        return response()->json([
            'success' => true,
            'data' => $route,
            'message' => 'Transport route created successfully'
        ]);
    }

    // =========================================
    // SHOW
    // =========================================
    public function show(Request $request, $id)
    {
        $school_id = $request->query('schoolId');

        $route = TransportRouteModel::getRouteById($id);

        if (!$route) {
            return response()->json([
                'success' => false,
                'message' => 'Transport route not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $route
        ]);
    }

    // =========================================
    // UPDATE
    // =========================================
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'route_name'   => 'sometimes|required|string|max:150',
            'monthly_fee'  => 'sometimes|required|numeric|min:0',
            'academic_year'=> 'sometimes|required|string|max:20',
            'driver_name'  => 'nullable|string|max:100',
            'status'       => 'sometimes|required|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors()
            ], 422);
        }

        $route = TransportRouteModel::updateRoute(
            $id,
            $request->all()
        );

        if (!$route) {
            return response()->json([
                'success' => false,
                'message' => 'Transport route not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $route,
            'message' => 'Transport route updated successfully'
        ]);
    }

    // =========================================
    // DELETE
    // =========================================
    public function destroy(Request $request, $id)
    {

        $deleted = TransportRouteModel::deleteRoute($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Transport route not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Transport route deleted successfully'
        ]);
    }
}

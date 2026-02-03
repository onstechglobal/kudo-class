<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TransportRouteModel;
use Illuminate\Support\Facades\Validator;

class TransportRouteController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = TransportRouteModel::query();

            // Apply search filter
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('route_name', 'like', "%{$search}%")
                      ->orWhere('driver_name', 'like', "%{$search}%");
                });
            }

            // Apply status filter
            if ($request->has('status') && !empty($request->status)) {
                $query->where('status', $request->status);
            }

            $routes = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $routes,
                'message' => 'Transport routes fetched successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch transport routes: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'route_name' => 'required|string|max:150',
                'monthly_fee' => 'required|numeric|min:0',
                'academic_year' => 'required|string|max:20',
                'driver_name' => 'nullable|string|max:100',
                'status' => 'required|in:active,inactive',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $route = TransportRouteModel::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $route,
                'message' => 'Transport route created successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create transport route: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $route = TransportRouteModel::find($id);

            if (!$route) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transport route not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $route,
                'message' => 'Transport route fetched successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch transport route: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $route = TransportRouteModel::find($id);

            if (!$route) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transport route not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'route_name' => 'sometimes|required|string|max:150',
                'monthly_fee' => 'sometimes|required|numeric|min:0',
                'driver_name' => 'nullable|string|max:100',
                'status' => 'sometimes|required|in:active,inactive',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $route->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $route,
                'message' => 'Transport route updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update transport route: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $route = TransportRouteModel::find($id);

            if (!$route) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transport route not found'
                ], 404);
            }

            $route->delete();

            return response()->json([
                'success' => true,
                'message' => 'Transport route deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete transport route: ' . $e->getMessage()
            ], 500);
        }
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransportRouteModel extends Model
{
    protected $table = 'tb_transport_routes';
    protected $primaryKey = 'route_id';
    public $timestamps = true;

    protected $fillable = [
        'school_id',
        'route_name',
        'monthly_fee',
        'academic_year',
        'driver_name',
        'status',
    ];

    protected $casts = [
        'monthly_fee' => 'decimal:2',
    ];

    // =========================================
    // GET ALL ROUTES (With Filters)
    // =========================================
    public static function getRoutes($school_id, $search = null, $status = null)
    {
        $query = self::where('school_id', $school_id);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('route_name', 'like', "%{$search}%")
                  ->orWhere('driver_name', 'like', "%{$search}%");
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    // =========================================
    // CREATE ROUTE
    // =========================================
    public static function createRoute($data)
    {
        return self::create($data);
    }

    // =========================================
    // GET SINGLE ROUTE
    // =========================================
    public static function getRouteById($id)
    {
        return self::where('route_id', $id)
                    ->first();
    }

    // =========================================
    // UPDATE ROUTE
    // =========================================
    public static function updateRoute($id, $data)
    {
        $route = self::where('route_id', $id)
                    ->first();

        if (!$route) {
            return null;
        }

        $route->update($data);
        return $route;
    }

    // =========================================
    // DELETE ROUTE
    // =========================================
    public static function deleteRoute($id)
    {
        $route = self::where('route_id', $id)
                    ->first();

        if (!$route) {
            return false;
        }

        return $route->delete();
    }
}

<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransportRouteModel extends Model
{
    protected $table = 'tb_transport_routes';
    protected $primaryKey = 'route_id';
    public $timestamps = true;

    protected $fillable = [
        'route_name',
        'monthly_fee',
        'academic_year',
        'driver_name',
        'status',
    ];

    protected $casts = [
        'monthly_fee' => 'decimal:2',
    ];
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeesPolicyModel extends Model
{
    protected $table = 'tb_fees_policy';
    protected $primaryKey = 'policy_id';

    protected $fillable = [
        'school_id', 
        'policy_name',
        'grace_days',
        'partial_payment',
        'late_reminder',
        'status'
    ];

    // This converts 0/1 to true/false automatically in JSON
    protected $casts = [
        'partial_payment' => 'boolean',
        'late_reminder' => 'boolean',
    ];
}
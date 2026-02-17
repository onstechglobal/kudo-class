<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PenaltyRuleModel extends Model
{
    protected $table = 'tb_penalty_rules';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'policy_id',
        'school_id',
        'fee_type',
        'penalty_type',
        'penalty_value',
        'grace_period_days',
        'frequency',
        'status',
        'created_at'
    ];

    public function policy()
    {
        return $this->belongsTo(FeePolicyModel::class, 'policy_id', 'policy_id');
    }
}

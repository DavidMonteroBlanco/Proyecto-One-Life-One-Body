<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeightRecord extends Model
{
    protected $fillable = [
        'user_id',
        'weight_kg',
        'fat_percentage',
        'muscle_percentage',
        'notes',
        'recorded_at',
    ];

    protected function casts(): array
    {
        return [
            'weight_kg'         => 'float',
            'fat_percentage'    => 'float',
            'muscle_percentage' => 'float',
            'recorded_at'       => 'date:Y-m-d',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
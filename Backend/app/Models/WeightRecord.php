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
            'weight_kg'         => 'decimal:1',
            'fat_percentage'    => 'decimal:1',
            'muscle_percentage' => 'decimal:1',
            'recorded_at'       => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
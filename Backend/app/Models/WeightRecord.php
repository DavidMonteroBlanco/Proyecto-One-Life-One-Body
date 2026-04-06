<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeightRecord extends Model
{
    protected $fillable = [
        'user_id',
        'weight_kg',
        'notes',
        'recorded_at',
    ];

    protected function casts(): array
    {
        return [
            'weight_kg'   => 'decimal:1',
            'recorded_at' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
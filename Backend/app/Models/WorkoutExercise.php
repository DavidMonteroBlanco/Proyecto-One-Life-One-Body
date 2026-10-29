<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkoutExercise extends Model
{
    protected $fillable = [
        'workout_id', 'name', 'sets', 'reps', 'weight',
        'rest_seconds', 'notes', 'wger_id', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sets'         => 'integer',
            'rest_seconds' => 'integer',
            'wger_id'      => 'integer',
            'sort_order'   => 'integer',
        ];
    }

    public function workout()
    {
        return $this->belongsTo(Workout::class);
    }
}

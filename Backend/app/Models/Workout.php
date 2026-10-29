<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Workout extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'goal',
        'duration_minutes',
        'level',
        'notes',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'duration_minutes' => 'integer',
            'sent_at'          => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /** Los ejercicios del entreno, en el orden en que los puso David. */
    public function exercises()
    {
        return $this->hasMany(WorkoutExercise::class)->orderBy('sort_order');
    }
}

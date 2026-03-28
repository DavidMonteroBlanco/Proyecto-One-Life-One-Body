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
    ];
    public function user()
{
  return $this->belongsTo(\App\Models\User::class);
}

}


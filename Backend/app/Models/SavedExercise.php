<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavedExercise extends Model
{
    protected $fillable = [
        'user_id',
        'source',
        'external_id',
        'name',
        'description',
    ];
}

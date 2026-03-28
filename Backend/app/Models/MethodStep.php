<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MethodStep extends Model
{
    protected $fillable = ['title', 'description', 'sort_order'];
}

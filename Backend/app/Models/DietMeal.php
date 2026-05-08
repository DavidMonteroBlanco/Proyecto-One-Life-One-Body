<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DietMeal extends Model
{
    protected $fillable = [
        'diet_plan_id',
        'meal_type',
        'foods',
        'calories',
        'macros',
        'sort_order',
    ];

    public function plan()
    {
        return $this->belongsTo(DietPlan::class, 'diet_plan_id');
    }

    /**
     * Label legible del tipo de comida.
     */
    public function getMealLabelAttribute(): string
    {
        return match($this->meal_type) {
            'desayuno'      => 'Desayuno',
            'media_manana'  => 'Media mañana',
            'comida'        => 'Comida',
            'merienda'      => 'Merienda',
            'cena'          => 'Cena',
            'pre_entreno'   => 'Pre-entreno',
            'post_entreno'  => 'Post-entreno',
            default         => $this->meal_type,
        };
    }
}
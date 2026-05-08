<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Plan de dieta asignado a un usuario
        Schema::create('diet_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');           // Ej: "Plan definición - Abril"
            $table->text('notes')->nullable();  // Notas generales del plan
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        // Comidas dentro de un plan (desayuno, comida, merienda, cena, etc.)
        Schema::create('diet_meals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('diet_plan_id')->constrained()->onDelete('cascade');
            $table->enum('meal_type', ['desayuno', 'media_manana', 'comida', 'merienda', 'cena', 'pre_entreno', 'post_entreno']);
            $table->text('foods');             // Descripción de alimentos
            $table->string('calories')->nullable();  // Ej: "450 kcal"
            $table->string('macros')->nullable();    // Ej: "40P / 30C / 20G"
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diet_meals');
        Schema::dropIfExists('diet_plans');
    }
};
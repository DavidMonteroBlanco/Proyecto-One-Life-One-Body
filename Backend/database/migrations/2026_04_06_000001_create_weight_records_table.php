<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('weight_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('weight_kg', 5, 1);    // Ej: 82.4
            $table->text('notes')->nullable();       // Nota opcional
            $table->date('recorded_at');             // Fecha del pesaje
            $table->timestamps();

            $table->index(['user_id', 'recorded_at']);
            // Un pesaje por día por usuario
            $table->unique(['user_id', 'recorded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weight_records');
    }
};
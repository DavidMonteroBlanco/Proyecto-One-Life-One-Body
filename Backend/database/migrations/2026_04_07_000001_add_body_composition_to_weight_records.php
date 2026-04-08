<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('weight_records', function (Blueprint $table) {
            $table->decimal('fat_percentage', 4, 1)->nullable()->after('weight_kg');     // Ej: 18.5
            $table->decimal('muscle_percentage', 4, 1)->nullable()->after('fat_percentage'); // Ej: 42.3
        });
    }

    public function down(): void
    {
        Schema::table('weight_records', function (Blueprint $table) {
            $table->dropColumn(['fat_percentage', 'muscle_percentage']);
        });
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Guarda cuándo se envió por email cada plan, para que en el panel se
 * vea de un vistazo qué cliente ya lo ha recibido y no se le mande dos
 * veces el mismo plan.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('diet_plans', function (Blueprint $table) {
            $table->timestamp('sent_at')->nullable()->after('active');
        });
    }

    public function down(): void
    {
        Schema::table('diet_plans', function (Blueprint $table) {
            $table->dropColumn('sent_at');
        });
    }
};

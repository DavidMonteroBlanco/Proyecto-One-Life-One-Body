<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tres piezas que le faltaban al panel del entrenador:
 *
 *   workout_exercises → el contenido real de un entreno. Hasta ahora un
 *                       entreno solo tenía título y duración, así que no
 *                       le decía al cliente qué hacer.
 *   notifications     → avisos dentro de la web, para que un plan no
 *                       dependa solo de que llegue el email.
 *   failed_operations → lo que falla queda guardado para reintentarlo
 *                       solo y, si aun así no sale, verlo en el panel.
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── Ejercicios dentro de un entreno ──
        Schema::create('workout_exercises', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workout_id')->constrained()->onDelete('cascade');

            $table->string('name');
            $table->unsignedSmallInteger('sets')->default(3);
            // Texto y no número: en la práctica se escribe "8-10" o "al fallo"
            $table->string('reps')->default('10');
            $table->string('weight')->nullable();      // "40 kg", "peso corporal"
            $table->unsignedSmallInteger('rest_seconds')->default(90);
            $table->text('notes')->nullable();

            // Id del ejercicio en la biblioteca wger, si se eligió de ahí.
            // Permite enseñarle al cliente el vídeo y las imágenes.
            $table->unsignedInteger('wger_id')->nullable();

            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['workout_id', 'sort_order']);
        });

        // Marca de cuándo se envió el entreno, igual que en las dietas
        Schema::table('workouts', function (Blueprint $table) {
            $table->timestamp('sent_at')->nullable()->after('notes');
        });

        // ── Avisos dentro de la web ──
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->string('type', 40);        // diet_plan, workout, appointment…
            $table->string('title');
            $table->text('body')->nullable();
            $table->string('link')->nullable(); // adónde lleva al pulsarlo

            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            // La consulta habitual es "las no leídas de este usuario"
            $table->index(['user_id', 'read_at']);
        });

        // ── Operaciones fallidas ──
        Schema::create('failed_operations', function (Blueprint $table) {
            $table->id();

            $table->string('operation', 60);   // enviar_dieta, enviar_entreno…
            $table->string('summary');         // una línea legible para el panel
            $table->json('payload');           // lo necesario para reintentarla

            $table->text('last_error')->nullable();
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('next_attempt_at')->nullable();
            $table->timestamp('resolved_at')->nullable();

            // Quién la lanzó y sobre qué cliente, para dar contexto
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('triggered_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index(['resolved_at', 'next_attempt_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('failed_operations');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('workout_exercises');

        Schema::table('workouts', function (Blueprint $table) {
            $table->dropColumn('sent_at');
        });
    }
};

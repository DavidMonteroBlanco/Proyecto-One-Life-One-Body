<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * Teléfono y fecha de nacimiento de los usuarios.
 *
 * Este fichero se llamaba "202 _03_29_..." (con un espacio en lugar del
 * 6 de 2026). Laravel ordena las migraciones por nombre y el espacio va
 * antes que cualquier número, así que se ejecutaba la cuarta, ANTES de
 * la que crea la columna "role" (2026_02_07). Como esta pide colocar
 * "phone" después de "role":
 *
 *   - en SQLite no pasaba nada: SQLite ignora la posición de columnas;
 *   - en MySQL/MariaDB fallaba con "Unknown column 'role'", y la
 *     instalación en un hosting con MySQL se quedaba a medias.
 *
 * Al renombrarlo, las bases que ya la ejecutaron con el nombre viejo la
 * ven como nueva. Por eso comprueba si las columnas ya existen: en esas
 * bases no hace nada y en una base nueva las crea.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after('role');
            }
            if (! Schema::hasColumn('users', 'birth_date')) {
                $table->date('birth_date')->nullable()->after('phone');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'birth_date']);
        });
    }
};

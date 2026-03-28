<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
{
    Schema::create('saved_exercises', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();

        $table->string('source', 30);          
        $table->unsignedBigInteger('external_id'); 

        $table->string('name', 180);
        $table->text('description')->nullable();

        $table->timestamps();

        $table->unique(['user_id', 'source', 'external_id']); 
    });
}


    
    public function down(): void
    {
        Schema::dropIfExists('saved_exercises');
    }
};

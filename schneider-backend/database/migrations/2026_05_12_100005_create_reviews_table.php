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
        Schema::create('reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->foreignUuid('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->foreignUuid('reviewer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('reviewee_id')->constrained('users')->cascadeOnDelete();
            
            $table->tinyInteger('service_rating');
            $table->tinyInteger('technician_rating');
            $table->tinyInteger('punctuality_rating');
            $table->decimal('average_rating', 3, 2)->storedAs('(service_rating + technician_rating + punctuality_rating) / 3');
            
            $table->text('comment')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};

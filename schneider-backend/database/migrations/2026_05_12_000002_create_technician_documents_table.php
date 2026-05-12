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
        Schema::create('technician_documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('technician_profile_id')->constrained()->cascadeOnDelete();
            
            $table->string('document_type'); // e.g., 'certification', 'id', 'license'
            $table->string('file_path');
            $table->string('verification_status')->default('pending');
            $table->timestamp('verified_at')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('technician_documents');
    }
};

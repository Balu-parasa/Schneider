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
        // Wallets Table (Tracks balances)
        Schema::create('wallets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('balance', 10, 2)->default(0.00);
            $table->timestamps();
            
            $table->unique('user_id');
        });

        // Transactions Table (Tracks simulated payments)
        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->string('currency')->default('USD');
            $table->string('payment_id')->nullable()->comment('Mock or Real Gateway ID');
            $table->string('status')->default('pending')->comment('pending, successful, failed');
            $table->json('metadata')->nullable()->comment('Gateway raw response');
            $table->timestamps();
        });

        // Wallet Transactions Table (Ledger)
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('wallet_id')->constrained()->cascadeOnDelete();
            $table->string('type')->comment('credit, debit');
            $table->decimal('amount', 10, 2);
            $table->string('reference_type')->nullable()->comment('booking, payout, refund');
            $table->uuid('reference_id')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Invoices Table
        Schema::create('invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('invoice_number')->unique();
            $table->foreignUuid('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax', 10, 2)->default(0.00);
            $table->decimal('platform_fee', 10, 2)->default(0.00);
            $table->decimal('total', 10, 2);
            $table->string('status')->default('paid');
            $table->string('pdf_path')->nullable();
            $table->timestamps();
        });

        // Payouts Table
        Schema::create('payouts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->string('status')->default('pending')->comment('pending, processing, completed, failed');
            $table->string('bank_account_info')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payouts');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('wallets');
    }
};

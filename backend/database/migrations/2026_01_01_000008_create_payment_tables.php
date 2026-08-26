<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->string('provider', 50)->default('RAZORPAY');
            $table->string('provider_payment_id', 100)->nullable()->unique();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 10)->default('INR');
            $table->enum('status', ['INITIATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED'])->default('INITIATED');
            $table->string('payment_method', 50)->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index('provider_payment_id');
        });

        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained('payments')->onDelete('cascade');
            $table->string('transaction_type', 100);
            $table->string('provider_transaction_id', 100)->nullable();
            $table->decimal('amount', 12, 2);
            $table->string('status', 50);
            $table->json('response_data')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
        Schema::dropIfExists('payments');
    }
};

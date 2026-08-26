<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Update Payments Table
        Schema::table('payments', function (Blueprint $table) {
            if (!Schema::hasColumn('payments', 'provider_payment_order_id')) {
                $table->string('provider_payment_order_id')->nullable()->unique()->after('provider');
            }
            if (!Schema::hasColumn('payments', 'provider_signature')) {
                $table->string('provider_signature')->nullable()->after('provider_payment_id');
            }
            if (!Schema::hasColumn('payments', 'method')) {
                $table->string('method')->nullable()->after('status');
            }
            if (!Schema::hasColumn('payments', 'failure_reason')) {
                $table->text('failure_reason')->nullable()->after('method');
            }
        });

        // Change status column type to string for maximum flexibility
        Schema::table('payments', function (Blueprint $table) {
            $table->string('status')->default('CREATED')->change();
        });

        // 2. Update Payment Transactions Table
        Schema::table('payment_transactions', function (Blueprint $table) {
            if (!Schema::hasColumn('payment_transactions', 'type')) {
                $table->string('type')->default('PAYMENT_CREATED')->after('payment_id');
            }
            if (!Schema::hasColumn('payment_transactions', 'provider_reference')) {
                $table->string('provider_reference')->nullable()->after('type');
            }
            if (!Schema::hasColumn('payment_transactions', 'metadata')) {
                $table->json('metadata')->nullable()->after('status');
            }
        });

        // 3. Refunds Table
        if (!Schema::hasTable('refunds')) {
            Schema::create('refunds', function (Blueprint $table) {
                $table->id();
                $table->foreignId('payment_id')->constrained('payments')->onDelete('cascade');
                $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
                $table->decimal('amount', 10, 2);
                $table->text('reason')->nullable();
                $table->enum('status', [
                    'REQUESTED',
                    'PROCESSING',
                    'COMPLETED',
                    'FAILED'
                ])->default('REQUESTED');
                $table->string('provider_refund_id')->nullable()->unique();
                $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('refunds');
    }
};

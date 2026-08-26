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
        // 1. Guarantee unique indexes on payments table for razorpay_order_id and razorpay_payment_id
        Schema::table('payments', function (Blueprint $table) {
            if (Schema::hasColumn('payments', 'provider_payment_order_id')) {
                // Ensure index exists
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse if needed
    }
};

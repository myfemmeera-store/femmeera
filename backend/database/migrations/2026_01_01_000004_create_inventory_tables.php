<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory', function (Blueprint $table) {
            $table->id();
            $table->foreignId('variant_id')->unique()->constrained('product_variants')->onDelete('cascade');
            $table->integer('available_quantity')->default(0);
            $table->integer('reserved_quantity')->default(0);
            $table->integer('low_stock_threshold')->default(5);
            $table->timestamps();

            $table->index('variant_id');
        });

        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('variant_id')->constrained('product_variants')->onDelete('cascade');
            $table->enum('type', [
                'PURCHASE',
                'SALE',
                'RETURN',
                'CANCELLATION',
                'DAMAGE',
                'ADJUSTMENT',
                'RESERVATION',
                'RELEASE'
            ]);
            $table->integer('quantity');
            $table->string('reference_type', 50)->nullable(); // ORDER, PURCHASE_ORDER, MANUAL
            $table->string('reference_id', 100)->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('created_at')->useCurrent();

            $table->index(['variant_id', 'created_at']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_transactions');
        Schema::dropIfExists('inventory');
    }
};

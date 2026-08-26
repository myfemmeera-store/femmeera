<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_zones', function (Blueprint $table) {
            $table->id();
            $table->string('zone_name', 100);
            $table->string('pincode_pattern')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('shipping_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipping_zone_id')->constrained('shipping_zones')->onDelete('cascade');
            $table->string('name', 100);
            $table->decimal('cost', 12, 2)->default(0.00);
            $table->decimal('min_order_total', 12, 2)->default(0.00);
            $table->string('estimated_days', 50)->default('3-5 Days');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('message');
            $table->string('type', 50);
            $table->boolean('is_read')->default(false);
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('group_name', 50)->default('general');
            $table->string('key_name', 100)->unique();
            $table->longText('value_content')->nullable();
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('action', 100);
            $table->string('entity_type', 100)->nullable();
            $table->string('entity_id', 100)->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['user_id', 'action', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('settings');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('shipping_methods');
        Schema::dropIfExists('shipping_zones');
    }
};

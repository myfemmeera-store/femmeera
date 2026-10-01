<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('notifications')) {
            Schema::table('notifications', function (Blueprint $table) {
                if (!Schema::hasColumn('notifications', 'link')) {
                    $table->string('link')->nullable()->after('type');
                }
                if (!Schema::hasColumn('notifications', 'updated_at')) {
                    $table->timestamp('updated_at')->nullable()->after('created_at');
                }
            });

            // Modify user_id column to be nullable if it exists
            try {
                DB::statement('ALTER TABLE notifications MODIFY user_id BIGINT UNSIGNED NULL');
            } catch (\Throwable $e) {}
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('notifications')) {
            Schema::table('notifications', function (Blueprint $table) {
                if (Schema::hasColumn('notifications', 'link')) {
                    $table->dropColumn('link');
                }
                if (Schema::hasColumn('notifications', 'updated_at')) {
                    $table->dropColumn('updated_at');
                }
            });
        }
    }
};

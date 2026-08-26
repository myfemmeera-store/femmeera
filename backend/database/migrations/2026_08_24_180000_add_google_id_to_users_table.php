<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'google_id')) {
                $table->string('google_id')->nullable()->unique()->after('email');
            }
            if (!Schema::hasColumn('users', 'provider')) {
                $table->string('provider', 50)->nullable()->default('local')->after('google_id');
            }
            if (!Schema::hasColumn('users', 'avatar')) {
                $table->string('avatar', 500)->nullable()->after('provider');
            }
            $table->string('password')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'avatar')) {
                $table->dropColumn('avatar');
            }
            if (Schema::hasColumn('users', 'provider')) {
                $table->dropColumn('provider');
            }
            if (Schema::hasColumn('users', 'google_id')) {
                $table->dropColumn('google_id');
            }
            $table->string('password')->nullable(false)->change();
        });
    }
};

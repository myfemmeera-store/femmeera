<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('coupons')) {
            Schema::table('coupons', function (Blueprint $table) {
                if (!Schema::hasColumn('coupons', 'influencer_name')) {
                    $table->string('influencer_name', 150)->nullable()->after('name');
                }
                if (!Schema::hasColumn('coupons', 'influencer_handle')) {
                    $table->string('influencer_handle', 100)->nullable()->after('influencer_name');
                }
                if (!Schema::hasColumn('coupons', 'influencer_commission_percent')) {
                    $table->decimal('influencer_commission_percent', 5, 2)->nullable()->default(0.00)->after('influencer_handle');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('coupons')) {
            Schema::table('coupons', function (Blueprint $table) {
                $table->dropColumn(['influencer_name', 'influencer_handle', 'influencer_commission_percent']);
            });
        }
    }
};

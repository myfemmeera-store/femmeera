<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'shiprocket_order_id')) {
                $table->string('shiprocket_order_id', 100)->nullable()->after('carrier');
            }
            if (!Schema::hasColumn('orders', 'shiprocket_shipment_id')) {
                $table->string('shiprocket_shipment_id', 100)->nullable()->after('shiprocket_order_id');
            }
            if (!Schema::hasColumn('orders', 'shiprocket_courier_id')) {
                $table->string('shiprocket_courier_id', 100)->nullable()->after('shiprocket_shipment_id');
            }
            if (!Schema::hasColumn('orders', 'courier_name')) {
                $table->string('courier_name', 100)->nullable()->after('shiprocket_courier_id');
            }
            if (!Schema::hasColumn('orders', 'shipment_status')) {
                $table->string('shipment_status', 100)->nullable()->after('courier_name');
            }
            if (!Schema::hasColumn('orders', 'chargeable_weight')) {
                $table->decimal('chargeable_weight', 10, 2)->nullable()->after('shipment_status');
            }
            if (!Schema::hasColumn('orders', 'awb_code')) {
                $table->string('awb_code', 100)->nullable()->after('chargeable_weight');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $columns = [
                'shiprocket_order_id',
                'shiprocket_shipment_id',
                'shiprocket_courier_id',
                'courier_name',
                'shipment_status',
                'chargeable_weight',
                'awb_code',
            ];
            foreach ($columns as $col) {
                if (Schema::hasColumn('orders', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};

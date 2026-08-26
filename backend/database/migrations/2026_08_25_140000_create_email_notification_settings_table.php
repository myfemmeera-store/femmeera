<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('email_notification_settings', function (Blueprint $table) {
            $table->id();
            $table->string('event_key')->unique();
            $table->string('name');
            $table->string('description');
            $table->enum('recipient_type', ['customer', 'admin'])->default('customer');
            $table->boolean('is_enabled')->default(true);
            $table->string('subject_template')->nullable();
            $table->timestamps();
        });

        // Seed default notification events
        $now = now();
        $defaults = [
            // Customer Notifications
            [
                'event_key' => 'welcome_email',
                'name' => 'Welcome Email',
                'description' => 'Sent to new customers upon account registration.',
                'recipient_type' => 'customer',
                'is_enabled' => true,
                'subject_template' => 'Welcome to Femmeera - Exclusive Luxury Fashion',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'event_key' => 'order_confirmation',
                'name' => 'Order Confirmation',
                'description' => 'Sent after payment verification or COD checkout.',
                'recipient_type' => 'customer',
                'is_enabled' => true,
                'subject_template' => 'Order Confirmation - Femmeera #{order_number}',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'event_key' => 'payment_confirmation',
                'name' => 'Payment Receipt',
                'description' => 'Sent after successful Razorpay payment verification.',
                'recipient_type' => 'customer',
                'is_enabled' => true,
                'subject_template' => 'Payment Received for Order #{order_number}',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'event_key' => 'order_processing',
                'name' => 'Order Processing',
                'description' => 'Sent when order status changes to Processing.',
                'recipient_type' => 'customer',
                'is_enabled' => true,
                'subject_template' => 'Your Order #{order_number} is being Processed',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'event_key' => 'order_shipped',
                'name' => 'Order Shipped',
                'description' => 'Sent when order status changes to Shipped.',
                'recipient_type' => 'customer',
                'is_enabled' => true,
                'subject_template' => 'Your Order #{order_number} has been Shipped!',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'event_key' => 'order_delivered',
                'name' => 'Order Delivered',
                'description' => 'Sent when order status changes to Delivered.',
                'recipient_type' => 'customer',
                'is_enabled' => true,
                'subject_template' => 'Your Order #{order_number} has been Delivered',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'event_key' => 'return_requested',
                'name' => 'Return Requested',
                'description' => 'Sent to customer when return request is submitted.',
                'recipient_type' => 'customer',
                'is_enabled' => true,
                'subject_template' => 'Return Request Received for Order #{order_number}',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'event_key' => 'return_approved',
                'name' => 'Return Approved',
                'description' => 'Sent when admin approves a return request.',
                'recipient_type' => 'customer',
                'is_enabled' => true,
                'subject_template' => 'Return Request Approved for Order #{order_number}',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'event_key' => 'return_rejected',
                'name' => 'Return Rejected',
                'description' => 'Sent when admin rejects a return request.',
                'recipient_type' => 'customer',
                'is_enabled' => true,
                'subject_template' => 'Update on Return Request for Order #{order_number}',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'event_key' => 'refund_initiated',
                'name' => 'Refund Initiated',
                'description' => 'Sent when refund processing is initiated.',
                'recipient_type' => 'customer',
                'is_enabled' => true,
                'subject_template' => 'Refund Initiated for Order #{order_number}',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'event_key' => 'refund_completed',
                'name' => 'Refund Completed',
                'description' => 'Sent when refund is completed.',
                'recipient_type' => 'customer',
                'is_enabled' => true,
                'subject_template' => 'Refund Processed Successfully for Order #{order_number}',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'event_key' => 'password_reset',
                'name' => 'Password Reset',
                'description' => 'Sent when customer requests password reset link.',
                'recipient_type' => 'customer',
                'is_enabled' => true,
                'subject_template' => 'Reset Your Femmeera Account Password',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            // Admin Notifications
            [
                'event_key' => 'admin_new_order',
                'name' => 'Admin: New Order Placed',
                'description' => 'Notification to admin when a new order is verified.',
                'recipient_type' => 'admin',
                'is_enabled' => true,
                'subject_template' => '[ALERT] New Order Placed #{order_number}',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'event_key' => 'admin_new_return',
                'name' => 'Admin: New Return Request',
                'description' => 'Notification to admin when customer files return.',
                'recipient_type' => 'admin',
                'is_enabled' => true,
                'subject_template' => '[ALERT] New Return Request for Order #{order_number}',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'event_key' => 'admin_payment_failure',
                'name' => 'Admin: Payment Failure',
                'description' => 'Notification to admin when payment verification fails.',
                'recipient_type' => 'admin',
                'is_enabled' => true,
                'subject_template' => '[ALERT] Payment Verification Failed for Order #{order_number}',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        DB::table('email_notification_settings')->insert($defaults);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_notification_settings');
    }
};

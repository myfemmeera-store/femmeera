<?php

namespace App\Jobs;

use App\Models\EmailNotificationSetting;
use App\Services\PHPMailerService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendEmailNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public string $eventKey;
    public string $recipientEmail;
    public string $recipientName;
    public array $data;
    public ?string $customSubject;

    /**
     * Create a new job instance.
     */
    public function __construct(
        string $eventKey,
        string $recipientEmail,
        string $recipientName = '',
        array $data = [],
        ?string $customSubject = null
    ) {
        $this->eventKey = $eventKey;
        $this->recipientEmail = $recipientEmail;
        $this->recipientName = $recipientName;
        $this->data = $data;
        $this->customSubject = $customSubject;
    }

    /**
     * Execute the job.
     */
    public function handle(PHPMailerService $mailer): void
    {
        // 1. Check if event is enabled in admin database settings
        if (!EmailNotificationSetting::isEventEnabled($this->eventKey)) {
            Log::info("SendEmailNotificationJob: Event '{$this->eventKey}' is disabled in Admin Email Settings. Skipping email to {$this->recipientEmail}.");
            return;
        }

        // 2. Resolve template view name
        $viewName = "emails.{$this->eventKey}";
        if (!view()->exists($viewName)) {
            Log::warning("SendEmailNotificationJob: View '{$viewName}' does not exist for event '{$this->eventKey}'. Skipping email.");
            return;
        }

        // 3. Resolve Subject
        $subject = $this->customSubject;
        if (empty($subject)) {
            $defaultSubject = $this->getDefaultSubjectForEvent($this->eventKey);
            $subject = EmailNotificationSetting::getSubjectTemplate($this->eventKey, $defaultSubject);
        }

        // Replace placeholders in subject if data available
        $subject = $this->replaceSubjectPlaceholders($subject, $this->data);

        // 4. Send Email via PHPMailer
        $mailer->sendTemplate(
            $this->recipientEmail,
            $this->recipientName,
            $viewName,
            $this->data,
            $subject
        );
    }

    /**
     * Helper to replace placeholders like {order_number}, {customer_name} in subjects.
     */
    protected function replaceSubjectPlaceholders(string $subject, array $data): string
    {
        $replacements = [
            '{order_number}' => $data['order']['order_number'] ?? $data['order_number'] ?? '',
            '{customer_name}' => $data['customer_name'] ?? $data['user']['name'] ?? $data['name'] ?? '',
            '{total_amount}' => isset($data['order']['total']) ? ('₹' . number_format($data['order']['total'], 2)) : '',
        ];

        foreach ($replacements as $key => $val) {
            $subject = str_replace($key, (string)$val, $subject);
        }

        return $subject;
    }

    /**
     * Default fallbacks for subject lines.
     */
    protected function getDefaultSubjectForEvent(string $eventKey): string
    {
        $map = [
            'welcome_email' => 'Welcome to Femmeera - Exclusive Luxury Fashion',
            'order_confirmation' => 'Order Confirmation - Femmeera #{order_number}',
            'payment_confirmation' => 'Payment Received for Order #{order_number}',
            'order_processing' => 'Your Order #{order_number} is being Processed',
            'order_shipped' => 'Your Order #{order_number} has been Shipped!',
            'order_delivered' => 'Your Order #{order_number} has been Delivered',
            'return_requested' => 'Return Request Received for Order #{order_number}',
            'return_approved' => 'Return Request Approved for Order #{order_number}',
            'return_rejected' => 'Update on Return Request for Order #{order_number}',
            'refund_initiated' => 'Refund Initiated for Order #{order_number}',
            'refund_completed' => 'Refund Processed Successfully for Order #{order_number}',
            'password_reset' => 'Reset Your Femmeera Account Password',
            'admin_new_order' => '[ALERT] New Order Placed #{order_number}',
            'admin_new_return' => '[ALERT] New Return Request for Order #{order_number}',
            'admin_payment_failure' => '[ALERT] Payment Verification Failed for Order #{order_number}',
        ];

        return $map[$eventKey] ?? 'Notification from Femmeera Store';
    }
}

<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmailNotificationSetting;
use App\Services\PHPMailerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailNotificationAdminController extends Controller
{
    /**
     * Get all email notification settings.
     */
    public function index(): JsonResponse
    {
        $settings = EmailNotificationSetting::orderBy('id', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'customer_notifications' => $settings->where('recipient_type', 'customer')->values(),
                'admin_notifications' => $settings->where('recipient_type', 'admin')->values(),
                'smtp_config' => [
                    'host' => env('MAIL_HOST', '127.0.0.1'),
                    'port' => env('MAIL_PORT', 587),
                    'from_address' => env('MAIL_FROM_ADDRESS', 'no-reply@femmeera.com'),
                    'from_name' => env('MAIL_FROM_NAME', 'Femmeera Store'),
                    'encryption' => env('MAIL_ENCRYPTION', 'tls'),
                    'has_username' => !empty(env('MAIL_USERNAME')),
                ],
            ],
        ]);
    }

    /**
     * Update notification toggles and subject templates.
     */
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'settings' => 'required|array',
            'settings.*.id' => 'required|exists:email_notification_settings,id',
            'settings.*.is_enabled' => 'required|boolean',
            'settings.*.subject_template' => 'nullable|string|max:255',
        ]);

        foreach ($request->input('settings') as $item) {
            EmailNotificationSetting::where('id', $item['id'])->update([
                'is_enabled' => (bool) $item['is_enabled'],
                'subject_template' => $item['subject_template'] ?? null,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Email notification settings updated successfully.',
        ]);
    }

    /**
     * Test SMTP Connection & Send Diagnostic Email.
     */
    public function testConnection(Request $request, PHPMailerService $mailer): JsonResponse
    {
        $request->validate([
            'test_email' => 'nullable|email',
        ]);

        $recipientEmail = $request->input('test_email', env('ADMIN_NOTIFICATION_EMAIL', 'admin@femmeera.com'));

        $result = $mailer->testSmtpConnection($recipientEmail);

        return response()->json([
            'success' => $result['success'],
            'message' => $result['message'],
            'details' => $result['details'] ?? [],
        ], $result['success'] ? 200 : 422);
    }
}

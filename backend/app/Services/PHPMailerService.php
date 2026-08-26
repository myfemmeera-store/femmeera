<?php

namespace App\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception as PHPMailerException;
use Illuminate\Support\Facades\Log;

class PHPMailerService
{
    /**
     * Build and configure a fresh PHPMailer instance.
     */
    protected function createMailer(): PHPMailer
    {
        $mail = new PHPMailer(true);

        $host = env('MAIL_HOST', config('mail.mailers.smtp.host', '127.0.0.1'));
        $port = (int) env('MAIL_PORT', config('mail.mailers.smtp.port', 587));
        $username = env('MAIL_USERNAME', config('mail.mailers.smtp.username', ''));
        $password = env('MAIL_PASSWORD', config('mail.mailers.smtp.password', ''));
        $encryption = env('MAIL_ENCRYPTION', config('mail.mailers.smtp.encryption', 'tls'));
        $fromAddress = env('MAIL_FROM_ADDRESS', config('mail.from.address', 'no-reply@femmeera.com'));
        $fromName = env('MAIL_FROM_NAME', config('mail.from.name', 'Femmeera Store'));

        // Server Settings
        $mail->isSMTP();
        $mail->Host = $host;
        $mail->Port = $port;
        $mail->CharSet = 'UTF-8';

        if (!empty($username)) {
            $mail->SMTPAuth = true;
            $mail->Username = $username;
            $mail->Password = $password;
        } else {
            $mail->SMTPAuth = false;
        }

        // Encryption Settings
        $encLower = strtolower((string) $encryption);
        if ($encLower === 'tls' || $encLower === 'starttls') {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        } elseif ($encLower === 'ssl') {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        } else {
            $mail->SMTPSecure = '';
            $mail->SMTPAutoTLS = false;
        }

        // Default Sender
        $mail->setFrom($fromAddress, $fromName);

        return $mail;
    }

    /**
     * Send raw HTML email to a recipient.
     */
    public function send(string $toEmail, string $toName, string $subject, string $htmlBody, string $altText = ''): bool
    {
        if (empty($toEmail) || !filter_var($toEmail, FILTER_VALIDATE_EMAIL)) {
            Log::warning("PHPMailerService: Invalid recipient email provided: '{$toEmail}'");
            return false;
        }

        try {
            $mail = $this->createMailer();
            $mail->addAddress($toEmail, $toName ?: $toEmail);
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $htmlBody;
            $mail->AltBody = $altText ?: strip_tags($htmlBody);

            $sent = $mail->send();
            if ($sent) {
                Log::info("PHPMailerService: Email successfully sent to {$toEmail} [Subject: {$subject}]");
            }
            return $sent;
        } catch (PHPMailerException $e) {
            Log::error("PHPMailerService Exception: Failed to send email to {$toEmail}. Error: " . $e->getMessage());
            return false;
        } catch (\Throwable $e) {
            Log::error("PHPMailerService General Exception: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Render a Blade email template and send via PHPMailer.
     */
    public function sendTemplate(string $toEmail, string $toName, string $viewName, array $viewData, string $subject): bool
    {
        try {
            $htmlBody = view($viewName, $viewData)->render();
            return $this->send($toEmail, $toName, $subject, $htmlBody);
        } catch (\Throwable $e) {
            Log::error("PHPMailerService Template Render Error [{$viewName}]: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Perform an SMTP connection diagnostic test.
     */
    public function testSmtpConnection(string $testRecipientEmail = ''): array
    {
        $host = env('MAIL_HOST', config('mail.mailers.smtp.host', '127.0.0.1'));
        $port = (int) env('MAIL_PORT', config('mail.mailers.smtp.port', 587));
        $username = env('MAIL_USERNAME', config('mail.mailers.smtp.username', ''));
        $fromAddress = env('MAIL_FROM_ADDRESS', config('mail.from.address', 'no-reply@femmeera.com'));

        try {
            $mail = $this->createMailer();
            
            if (!empty($testRecipientEmail)) {
                $mail->addAddress($testRecipientEmail, 'Test Recipient');
                $mail->isHTML(true);
                $mail->Subject = 'Femmeera SMTP Diagnostic Test Email';
                $mail->Body = '<h1>Femmeera SMTP Connection Test</h1><p>This is a test email sent from Femmeera Store PHPMailer Service.</p>';
                $mail->send();
                return [
                    'success' => true,
                    'message' => "SMTP connection verified! Diagnostic email sent successfully to {$testRecipientEmail}.",
                    'details' => [
                        'host' => $host,
                        'port' => $port,
                        'from' => $fromAddress,
                        'auth' => !empty($username),
                    ],
                ];
            }

            // Connection only test
            $smtp = new SMTP();
            $smtp->setTimeout(10);
            if (!$smtp->connect($host, $port)) {
                return ['success' => false, 'message' => "Failed to connect to SMTP host {$host}:{$port}."];
            }
            $smtp->close();

            return [
                'success' => true,
                'message' => "SMTP Host {$host}:{$port} is reachable and responsive.",
                'details' => [
                    'host' => $host,
                    'port' => $port,
                    'from' => $fromAddress,
                    'auth' => !empty($username),
                ],
            ];
        } catch (PHPMailerException $e) {
            return [
                'success' => false,
                'message' => "SMTP Configuration Error: " . $e->getMessage(),
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'message' => "SMTP General Error: " . $e->getMessage(),
            ];
        }
    }
}

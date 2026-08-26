<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Request;

class AuditLogService
{
    /**
     * Record an auditable administrative or security action.
     */
    public static function log(
        string $action,
        ?int $userId = null,
        ?string $entityType = null,
        ?string $entityId = null,
        ?array $oldValues = null,
        ?array $newValues = null
    ): void {
        // Sanitize sensitive fields if present
        $sensitiveKeys = ['password', 'password_confirmation', 'token', 'secret', 'credit_card'];
        
        $sanitize = function (?array $data) use ($sensitiveKeys, &$sanitize) {
            if (!$data) return null;
            $clean = [];
            foreach ($data as $key => $value) {
                if (in_array(strtolower($key), $sensitiveKeys)) {
                    $clean[$key] = '[REDACTED]';
                } elseif (is_array($value)) {
                    $clean[$key] = $sanitize($value);
                } else {
                    $clean[$key] = $value;
                }
            }
            return $clean;
        };

        DB::table('audit_logs')->insert([
            'user_id' => $userId ?? auth()->id(),
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId ? (string)$entityId : null,
            'old_values' => $oldValues ? json_encode($sanitize($oldValues)) : null,
            'new_values' => $newValues ? json_encode($sanitize($newValues)) : null,
            'ip_address' => Request::ip(),
            'user_agent' => Request::header('User-Agent'),
            'created_at' => now(),
        ]);
    }
}

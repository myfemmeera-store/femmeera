<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailNotificationSetting extends Model
{
    use HasFactory;

    protected $table = 'email_notification_settings';

    protected $fillable = [
        'event_key',
        'name',
        'description',
        'recipient_type',
        'is_enabled',
        'subject_template',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
    ];

    /**
     * Check if a specific notification event key is enabled.
     */
    public static function isEventEnabled(string $eventKey): bool
    {
        $setting = static::where('event_key', $eventKey)->first();
        return $setting ? (bool) $setting->is_enabled : true;
    }

    /**
     * Get subject template for an event key.
     */
    public static function getSubjectTemplate(string $eventKey, string $defaultSubject = ''): string
    {
        $setting = static::where('event_key', $eventKey)->first();
        return ($setting && !empty($setting->subject_template)) ? $setting->subject_template : $defaultSubject;
    }
}

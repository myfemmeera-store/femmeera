<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminNotificationController extends Controller
{
    /**
     * Get store notifications for admin.
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = Notification::orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        $formatted = $notifications->map(function ($item) {
            return [
                'id' => (string) $item->id,
                'type' => $item->type ?? 'order',
                'title' => $item->title,
                'description' => $item->message,
                'time' => $item->created_at ? $item->created_at->diffForHumans() : 'Just now',
                'created_at' => $item->created_at ? $item->created_at->toIso8601String() : null,
                'link' => $item->link ?? '/dashboard/orders',
                'isRead' => (bool) $item->is_read,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formatted,
            'unread_count' => $notifications->where('is_read', false)->count(),
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(int $id): JsonResponse
    {
        $notification = Notification::find($id);
        if ($notification) {
            $notification->update(['is_read' => true]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read.',
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllRead(): JsonResponse
    {
        Notification::query()->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read.',
        ]);
    }
}

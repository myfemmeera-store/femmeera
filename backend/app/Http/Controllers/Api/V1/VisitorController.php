<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class VisitorController extends Controller
{
    /**
     * Ensure visitor_sessions table exists dynamically
     */
    private function ensureTableExists(): void
    {
        if (!Schema::hasTable('visitor_sessions')) {
            Schema::create('visitor_sessions', function ($table) {
                $table->id();
                $table->string('session_id', 100)->unique();
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->timestamp('first_seen_at')->useCurrent();
                $table->timestamp('last_seen_at')->useCurrent();
                $table->enum('status', ['ACTIVE', 'LEFT'])->default('ACTIVE');
                $table->timestamps();
            });
        }
    }

    /**
     * Record or refresh heartbeat from active storefront visitor
     */
    public function heartbeat(Request $request): JsonResponse
    {
        try {
            $this->ensureTableExists();

            $sessionId = $request->input('session_id');
            if (!$sessionId) {
                return response()->json(['success' => false, 'message' => 'Missing session ID'], 422);
            }

            $ip = $request->ip();
            $userAgent = substr($request->userAgent() ?? '', 0, 500);
            $now = now();

            $exists = DB::table('visitor_sessions')->where('session_id', $sessionId)->first();

            if ($exists) {
                DB::table('visitor_sessions')->where('session_id', $sessionId)->update([
                    'last_seen_at' => $now,
                    'status' => 'ACTIVE',
                    'updated_at' => $now,
                ]);
            } else {
                DB::table('visitor_sessions')->insert([
                    'session_id' => $sessionId,
                    'ip_address' => $ip,
                    'user_agent' => $userAgent,
                    'first_seen_at' => $now,
                    'last_seen_at' => $now,
                    'status' => 'ACTIVE',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            return response()->json(['success' => true, 'message' => 'Heartbeat recorded']);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Mark visitor as left when window/tab closes
     */
    public function leave(Request $request): JsonResponse
    {
        try {
            $this->ensureTableExists();

            $sessionId = $request->input('session_id');
            if (!$sessionId) {
                $rawContent = $request->getContent();
                if ($rawContent) {
                    $decoded = json_decode($rawContent, true);
                    $sessionId = $decoded['session_id'] ?? null;
                }
            }

            if ($sessionId) {
                DB::table('visitor_sessions')->where('session_id', $sessionId)->update([
                    'status' => 'LEFT',
                    'updated_at' => now(),
                ]);
            }

            return response()->json(['success' => true, 'message' => 'Visitor left']);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Get live & total visitor statistics for Admin Dashboard
     */
    public function getStats(): JsonResponse
    {
        try {
            $this->ensureTableExists();

            // Active within last 30 seconds and status is ACTIVE
            $threshold = now()->subSeconds(30);

            $liveVisitors = DB::table('visitor_sessions')
                ->where('status', 'ACTIVE')
                ->where('last_seen_at', '>=', $threshold)
                ->count();

            $totalVisitors = DB::table('visitor_sessions')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'live_visitors' => $liveVisitors,
                    'total_visitors' => $totalVisitors,
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => true,
                'data' => [
                    'live_visitors' => 0,
                    'total_visitors' => 0,
                ],
            ]);
        }
    }
}

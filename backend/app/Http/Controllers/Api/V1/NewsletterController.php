<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class NewsletterController extends Controller
{
    /**
     * Subscribe customer email to newsletter
     * POST /api/v1/newsletter/subscribe
     */
    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|max:255',
        ]);

        $email = strtolower(trim($request->input('email')));

        // Ensure newsletter_subscribers table exists
        if (!Schema::hasTable('newsletter_subscribers')) {
            Schema::create('newsletter_subscribers', function ($table) {
                $table->id();
                $table->string('email', 191)->unique();
                $table->boolean('is_active')->default(true);
                $table->string('coupon_code', 50)->default('WELCOME10');
                $table->timestamps();
            });
        }

        // Insert or ignore if already subscribed
        $existing = DB::table('newsletter_subscribers')->where('email', $email)->first();
        if (!$existing) {
            DB::table('newsletter_subscribers')->insert([
                'email' => $email,
                'is_active' => true,
                'coupon_code' => 'WELCOME10',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Thank you for subscribing to Femmeera! Use promo code WELCOME10 for 10% off your first order.',
            'data' => [
                'coupon_code' => 'WELCOME10',
                'discount' => '10% OFF',
            ],
        ], 200);
    }
}

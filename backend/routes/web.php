<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'Femmeera API',
        'status' => 'online'
    ]);
});

// Dynamic Storage Media File Server (Multi-location search for Hostinger compatibility)
Route::get('/storage/{path}', function ($path) {
    try {
        $cleanPath = ltrim(str_replace(['..', '\\'], ['', '/'], $path), '/');
        
        $possiblePaths = [
            storage_path('app/public/' . $cleanPath),
            public_path('storage/' . $cleanPath),
            base_path('storage/app/public/' . $cleanPath),
        ];

        $filePath = null;
        foreach ($possiblePaths as $p) {
            if (file_exists($p) && is_file($p)) {
                $filePath = $p;
                break;
            }
        }

        if (!$filePath) {
            return response()->json(['message' => 'File not found: ' . $cleanPath], 404);
        }

        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $mimeTypes = [
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'webp' => 'image/webp',
            'gif' => 'image/gif',
            'svg' => 'image/svg+xml',
            'mp4' => 'video/mp4',
            'webm' => 'video/webm',
        ];

        $mimeType = $mimeTypes[$extension] ?? (@mime_content_type($filePath) ?: 'application/octet-stream');

        return response()->file($filePath, [
            'Content-Type' => $mimeType,
            'Access-Control-Allow-Origin' => '*',
            'Cache-Control' => 'public, max-age=31536000',
        ]);
    } catch (\Throwable $e) {
        return response()->json(['message' => 'Error serving storage file', 'error' => $e->getMessage()], 500);
    }
})->where('path', '.*');

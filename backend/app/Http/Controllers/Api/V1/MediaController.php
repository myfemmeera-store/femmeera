<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    /**
     * Upload an image or video file to Laravel public storage disk and sync to public/storage.
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:jpeg,png,jpg,gif,svg,mp4,webm,ogg,mov,m4v,qt,avi,mkv|max:102400',
            'folder' => 'nullable|string',
        ]);

        $folder = $request->input('folder', 'general');
        $file = $request->file('file');

        $yearMonth = date('Y/m');
        $extension = strtolower($file->getClientOriginalExtension());
        $fileName = Str::uuid() . '.' . $extension;
        $path = "{$folder}/{$yearMonth}/{$fileName}";

        $disk = 'public';
        Storage::disk($disk)->putFileAs("{$folder}/{$yearMonth}", $file, $fileName);

        $storagePath = storage_path("app/public/{$folder}/{$yearMonth}/{$fileName}");
        $publicPath = public_path("storage/{$folder}/{$yearMonth}/{$fileName}");

        // Directly copy file to public/storage folder so Hostinger web server serves it natively
        $publicDir = dirname($publicPath);
        if (!file_exists($publicDir)) {
            @mkdir($publicDir, 0755, true);
        }
        if (file_exists($storagePath)) {
            @copy($storagePath, $publicPath);
        }

        // Ensure 0755 dir and 0644 file permissions for Hostinger
        if (file_exists($storagePath)) {
            @chmod($storagePath, 0644);
            @chmod(dirname($storagePath), 0755);
            @chmod(dirname(dirname($storagePath)), 0755);
        }
        if (file_exists($publicPath)) {
            @chmod($publicPath, 0644);
            @chmod(dirname($publicPath), 0755);
            @chmod(dirname(dirname($publicPath)), 0755);
        }

        // Generate full web-accessible URL
        $url = asset('storage/' . $path);

        return response()->json([
            'success' => true,
            'message' => 'Media file uploaded successfully.',
            'data' => [
                'url' => $url,
                'path' => $path,
                'disk' => $disk,
                'filename' => $fileName,
                'mime_type' => $file->getClientMimeType(),
                'size' => $file->getSize(),
            ],
        ], 201);
    }
}

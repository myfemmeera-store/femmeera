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
     * Upload an image or video file to Laravel public storage disk.
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:jpeg,png,jpg,webp,gif,svg,mp4,webm,ogg,mov,m4v,qt,avi,mkv|max:102400',
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

        // Ensure file & directory permissions are web-readable on Hostinger (0755 dirs, 0644 files)
        $storagePath = storage_path("app/public/{$folder}/{$yearMonth}/{$fileName}");
        $publicPath = public_path("storage/{$folder}/{$yearMonth}/{$fileName}");

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

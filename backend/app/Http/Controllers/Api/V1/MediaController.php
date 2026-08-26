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
            'folder' => 'nullable|string|in:products,categories,banners,cms,branding,reviews',
        ]);

        $folder = $request->input('folder', 'general');
        $file = $request->file('file');

        $yearMonth = date('Y/m');
        $extension = strtolower($file->getClientOriginalExtension());
        $fileName = Str::uuid() . '.' . $extension;
        $path = "{$folder}/{$yearMonth}/{$fileName}";

        // Save file explicitly to public storage disk so it is web accessible locally
        $disk = 'public';
        Storage::disk($disk)->putFileAs("{$folder}/{$yearMonth}", $file, $fileName);

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

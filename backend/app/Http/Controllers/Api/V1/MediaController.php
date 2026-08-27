<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    /**
     * Upload an image or video file, automatically converting images to WebP format.
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
        $uuid = Str::uuid();

        // Image formats eligible for WebP conversion
        $isConvertibleImage = in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']);
        $hasGdWebp = function_exists('imagewebp');

        if ($isConvertibleImage && $hasGdWebp) {
            $fileName = "{$uuid}.webp";
            $mimeType = 'image/webp';
        } else {
            $fileName = "{$uuid}.{$extension}";
            $mimeType = $file->getClientMimeType();
        }

        $path = "{$folder}/{$yearMonth}/{$fileName}";

        $storageDir = storage_path("app/public/{$folder}/{$yearMonth}");
        $publicDir = public_path("storage/{$folder}/{$yearMonth}");

        if (!file_exists($storageDir)) {
            @mkdir($storageDir, 0755, true);
        }
        if (!file_exists($publicDir)) {
            @mkdir($publicDir, 0755, true);
        }

        $storagePath = "{$storageDir}/{$fileName}";
        $publicPath = "{$publicDir}/{$fileName}";

        if ($isConvertibleImage && $hasGdWebp) {
            // Convert image to optimized WebP format
            $converted = $this->convertToWebp($file->getRealPath(), $storagePath, 85);
            if (!$converted) {
                // Fallback to saving original file if GD conversion fails
                $file->move($storageDir, $fileName);
            }
        } else {
            $file->move($storageDir, $fileName);
        }

        // Mirror file directly to public/storage directory for Hostinger compatibility
        if (file_exists($storagePath)) {
            @copy($storagePath, $publicPath);
            @chmod($storagePath, 0644);
            @chmod($storageDir, 0755);
        }
        if (file_exists($publicPath)) {
            @chmod($publicPath, 0644);
            @chmod($publicDir, 0755);
        }

        $url = asset('storage/' . $path);

        return response()->json([
            'success' => true,
            'message' => 'Media file uploaded and converted to WebP successfully.',
            'data' => [
                'url' => $url,
                'path' => $path,
                'disk' => 'public',
                'filename' => $fileName,
                'mime_type' => $mimeType,
                'size' => file_exists($storagePath) ? filesize($storagePath) : $file->getSize(),
            ],
        ], 201);
    }

    /**
     * Helper method to convert image file to WebP format using PHP GD.
     */
    private function convertToWebp(string $sourcePath, string $destinationPath, int $quality = 85): bool
    {
        $info = @getimagesize($sourcePath);
        if (!$info) return false;

        $mime = $info['mime'];
        $image = null;

        switch ($mime) {
            case 'image/jpeg':
                $image = @imagecreatefromjpeg($sourcePath);
                break;
            case 'image/png':
                $image = @imagecreatefrompng($sourcePath);
                if ($image) {
                    imagealphablending($image, true);
                    imagesavealpha($image, true);
                }
                break;
            case 'image/webp':
                $image = @imagecreatefromwebp($sourcePath);
                break;
            case 'image/gif':
                $image = @imagecreatefromgif($sourcePath);
                break;
            case 'image/bmp':
                $image = @imagecreatefrombmp($sourcePath);
                break;
        }

        if (!$image) return false;

        $result = @imagewebp($image, $destinationPath, $quality);
        imagedestroy($image);

        return (bool) $result;
    }
}

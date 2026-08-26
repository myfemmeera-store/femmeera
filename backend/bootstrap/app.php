<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api/v1',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->validateCsrfTokens(except: [
            'api/*',
            'api/v1/*',
            'payments/webhook/*',
        ]);
        
        $middleware->alias([
            'admin.access' => \App\Http\Middleware\CheckAdminAccess::class,
            'permission' => \App\Http\Middleware\CheckPermission::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->wantsJson()) {
                if ($e instanceof ValidationException) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Validation failed.',
                        'errors' => $e->errors(),
                    ], 422);
                }

                $status = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;
                if ($e instanceof NotFoundHttpException) {
                    $status = 404;
                }

                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage() ?: 'An error occurred',
                    'code' => $status,
                ], $status);
            }
        });
    })->create();

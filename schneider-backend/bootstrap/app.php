<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api/v1.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
        apiPrefix: 'api/v1',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (Throwable $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*')) {
                $statusCode = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;
                // Treat validation exceptions as 422 automatically
                if ($e instanceof \Illuminate\Validation\ValidationException) {
                    $statusCode = 422;
                }
                
                $message = $e->getMessage() ?: 'Server Error';

                return response()->json([
                    'success' => false,
                    'message' => $message,
                    'data' => null,
                    'errors' => method_exists($e, 'errors') ? $e->errors() : null,
                ], $statusCode);
            }
        });
    })->create();

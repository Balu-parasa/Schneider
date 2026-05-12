<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ServiceController;
use App\Http\Controllers\Api\V1\CustomerBookingController;
use App\Http\Controllers\Api\V1\TechnicianBookingController;
use App\Http\Controllers\Api\V1\AdminBookingController;
use App\Http\Controllers\Api\V1\TechnicianLocationController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\WalletController;
use App\Http\Controllers\Api\V1\AdminAnalyticsController;

/*
|--------------------------------------------------------------------------
| API V1 Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application.
| All routes are prefixed with /api/v1 as defined in bootstrap/app.php
|
*/

// Public routes
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:login');
});

Route::get('services', [ServiceController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth User
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });

    // Customer Routes
    Route::middleware('role:customer')->prefix('customer')->group(function () {
        Route::apiResource('bookings', CustomerBookingController::class)->only(['index', 'store', 'show']);
        
        // Payment & Invoice Routes
        Route::post('bookings/{booking}/payment/simulate', [PaymentController::class, 'simulate']);
        Route::get('bookings/{booking}/invoice', [PaymentController::class, 'downloadInvoice']);
    });

    // Technician Routes
    Route::middleware('role:technician')->prefix('technician')->group(function () {
        Route::get('bookings', [TechnicianBookingController::class, 'index']);
        Route::post('bookings/{booking}/accept', [TechnicianBookingController::class, 'accept']);
        Route::patch('bookings/{booking}/status', [TechnicianBookingController::class, 'updateStatus']);
        
        // Location updates throttled to 12 per minute (approx every 5s)
        Route::post('location', [TechnicianLocationController::class, 'update'])->middleware('throttle:12,1');

        // Wallet Routes
        Route::get('wallet', [WalletController::class, 'getBalance']);
        Route::post('wallet/withdraw', [WalletController::class, 'withdraw']);
    });

    // Admin Routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('bookings', [AdminBookingController::class, 'index']);
        Route::patch('bookings/{booking}/assign', [AdminBookingController::class, 'assign']);
        Route::patch('bookings/{booking}/cancel', [AdminBookingController::class, 'cancel']);
        
        Route::get('technicians/{technicianId}/location', [TechnicianLocationController::class, 'latest']);

        // Analytics
        Route::get('analytics/kpis', [AdminAnalyticsController::class, 'kpis']);
        Route::get('analytics/revenue-chart', [AdminAnalyticsController::class, 'revenueChart']);
    });
});

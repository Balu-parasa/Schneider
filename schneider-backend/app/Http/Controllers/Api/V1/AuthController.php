<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\AuthResource;
use App\Services\AuthService;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    use ApiResponses;

    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Register a new user.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->register($request->validated());
        
        $user->load('technicianProfile');

        return $this->created(
            new AuthResource($user),
            'Registration successful. Please login.'
        );
    }

    /**
     * Authenticate user (Sanctum SPA).
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->authService->login($request->validated());

        $user->load('technicianProfile');

        return $this->success(
            new AuthResource($user),
            'Login successful'
        );
    }

    /**
     * Logout user.
     */
    public function logout(): JsonResponse
    {
        $this->authService->logout();

        return $this->success(null, 'Logged out successfully');
    }

    /**
     * Get current authenticated user.
     */
public function me(Request $request): JsonResponse
{
    $user = $request->user();

    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthenticated'
        ], 401);
    }

    $user->load('technicianProfile');

    return $this->success(new AuthResource($user));
}
}

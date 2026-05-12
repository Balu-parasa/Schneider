<?php

namespace App\Services;

use App\Models\User;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;

class AuthService extends BaseService
{
    /**
     * Register a new user and assign roles.
     *
     * @param array $data
     * @return User
     * @throws \Exception
     */
    public function register(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'phone' => $data['phone'] ?? null,
                'status' => UserStatus::Active->value,
            ]);

            // Assign role
            $role = UserRole::tryFrom($data['role']);
            if ($role) {
                $user->assignRole($role->value);

                // Create technician profile if role is technician
                if ($role === UserRole::Technician) {
                    $user->technicianProfile()->create([]);
                }
            } else {
                $user->assignRole(UserRole::Customer->value);
            }

            return $user;
        });
    }

    /**
     * Attempt login with given credentials.
     *
     * @param array $credentials
     * @return User
     * @throws ValidationException
     */
    public function login(array $credentials): User
    {
        if (!Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        /** @var User $user */
        $user = Auth::user();

        // Check if user is active
        if ($user->status !== UserStatus::Active->value) {
            Auth::logout();
            throw ValidationException::withMessages([
                'email' => __('Your account has been ' . $user->status . '. Please contact support.'),
            ]);
        }

        // Update last seen
        $user->update(['last_seen_at' => now()]);
        
        // Regenerate session to prevent fixation
        request()->session()->regenerate();

        return $user;
    }

    /**
     * Logout user and invalidate session.
     *
     * @return void
     */
    public function logout(): void
    {
        Auth::guard('web')->logout();
        
        request()->session()->invalidate();
        request()->session()->regenerateToken();
    }
}

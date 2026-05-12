<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@schneider.com'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('password123'),
                'status' => UserStatus::Active->value,
                'email_verified_at' => now(),
            ]
        );

        if (!$admin->hasRole(UserRole::Admin->value)) {
            $admin->assignRole(UserRole::Admin->value);
        }
    }
}

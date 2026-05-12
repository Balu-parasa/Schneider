<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Service;
use App\Models\Booking;
use App\Models\ServiceCategory;
use App\Services\PaymentSimulatorService;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(PaymentSimulatorService $paymentService)
    {
        $this->command->info('Seeding Demo Data...');

        // 1. Ensure Customer exists
        $customer = User::role('customer')->first();
        if (!$customer) {
            $customer = User::create([
                'name' => 'Demo Customer',
                'email' => 'customer@demo.com',
                'password' => Hash::make('password'),
            ]);
            $customer->assignRole('customer');
        }

        // 2. Ensure Technicians exist
        $technicians = User::role('technician')->get();
        if ($technicians->isEmpty()) {
            for ($i = 1; $i <= 5; $i++) {
                $tech = User::create([
                    'name' => "Demo Technician $i",
                    'email' => "tech$i@demo.com",
                    'password' => Hash::make('password'),
                ]);
                $tech->assignRole('technician');
                $technicians->push($tech);
            }
        }

        // 3. Ensure Services exist
        $services = Service::all();
        if ($services->isEmpty()) {
            $category = ServiceCategory::firstOrCreate([
                'name' => 'HVAC Maintenance',
                'slug' => 'hvac-maintenance',
                'description' => 'Heating and Cooling',
                'is_active' => true
            ]);

            $services->push(Service::create([
                'category_id' => $category->id,
                'name' => 'AC Repair',
                'slug' => 'ac-repair',
                'description' => 'Fix broken AC',
                'base_price' => 150.00,
                'pricing_type' => 'fixed',
                'estimated_duration' => 120,
                'is_active' => true,
            ]));
            
            $services->push(Service::create([
                'category_id' => $category->id,
                'name' => 'Heater Install',
                'slug' => 'heater-install',
                'description' => 'Install new heater',
                'base_price' => 300.00,
                'pricing_type' => 'fixed',
                'estimated_duration' => 240,
                'is_active' => true,
            ]));
        }

        // 4. Generate Historical Bookings (Last 7 Days)
        for ($i = 6; $i >= 0; $i--) {
            $numBookings = rand(1, 3);
            for ($j = 0; $j < $numBookings; $j++) {
                $service = $services->random();
                $technician = $technicians->random();
                
                $booking = Booking::create([
                    'booking_number' => 'BKG-HIST-' . strtoupper(Str::random(6)),
                    'customer_id' => $customer->id,
                    'technician_id' => $technician->id,
                    'service_id' => $service->id,
                    'status' => 'in_progress', // Set to in_progress to allow payment processing
                    'total_price' => $service->base_price,
                    'address' => 'Historical Address ' . rand(1, 100),
                    'city' => 'Demo City',
                    'latitude' => 37.7749 + (rand(-50, 50) / 1000),
                    'longitude' => -122.4194 + (rand(-50, 50) / 1000),
                    'created_at' => Carbon::now()->subDays($i)->subHours(rand(1, 12)),
                ]);

                // Simulate a successful payment
                try {
                    $paymentService->processMockPayment($booking, ['card_number' => '4242424242424242']);
                } catch (\Exception $e) {
                    // Ignore simulation failures in seeder
                }
            }
        }

        // 5. Generate Active "In Progress" Bookings
        for ($k = 0; $k < 2; $k++) {
            $service = $services->random();
            Booking::create([
                'booking_number' => 'BKG-ACT-' . strtoupper(Str::random(6)),
                'customer_id' => $customer->id,
                'technician_id' => $technicians->random()->id,
                'service_id' => $service->id,
                'status' => 'in_progress',
                'total_price' => $service->base_price,
                'address' => 'Active Address ' . rand(1, 100),
                'city' => 'Demo City',
                'latitude' => 37.7749 + (rand(-50, 50) / 1000),
                'longitude' => -122.4194 + (rand(-50, 50) / 1000),
            ]);
        }

        $this->command->info('Demo Data Seeded successfully!');
    }
}

<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Booking;
use App\Models\User;
use App\Models\Service;
use Illuminate\Support\Str;
use App\Services\PaymentSimulatorService;
use App\Events\BookingStatusUpdated;

class DemoSimulate extends Command
{
    protected $signature = 'demo:simulate {--type=booking}';
    protected $description = 'Simulate live system activity for the demo presentation';

    public function handle(PaymentSimulatorService $paymentService)
    {
        $type = $this->option('type');

        if ($type === 'booking') {
            $this->simulateBookingCreation();
        } elseif ($type === 'payment') {
            $this->simulatePayment($paymentService);
        }

        $this->info("Simulated $type activity successfully.");
    }

    private function simulateBookingCreation()
    {
        $customer = User::role('customer')->inRandomOrder()->first();
        $service = Service::inRandomOrder()->first();

        $booking = Booking::create([
            'booking_number' => 'BKG-' . strtoupper(Str::random(6)),
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'status' => 'pending',
            'total_price' => $service->base_price,
            'address' => '123 Simulated St',
            'city' => 'Demo City',
            'latitude' => 37.7749 + (rand(-100, 100) / 10000),
            'longitude' => -122.4194 + (rand(-100, 100) / 10000),
            'scheduled_at' => now()->addDays(1),
        ]);

        event(new BookingStatusUpdated($booking));
    }

    private function simulatePayment(PaymentSimulatorService $paymentService)
    {
        $booking = Booking::where('status', 'in_progress')->inRandomOrder()->first();
        if (!$booking) return;

        try {
            $paymentService->processMockPayment($booking, ['card_number' => '4242424242424242']);
            event(new BookingStatusUpdated($booking->fresh()));
        } catch (\Exception $e) {
            // Random simulation failure expected
        }
    }
}

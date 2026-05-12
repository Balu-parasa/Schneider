<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\User;
use App\Models\Service;
use App\Enums\BookingStatus;
use App\Events\BookingCreated;
use App\Events\BookingAccepted;
use App\Events\BookingStatusUpdated;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class BookingService extends BaseService
{
    /**
     * Create a new booking.
     */
    public function createBooking(User $customer, array $data): Booking
    {
        return DB::transaction(function () use ($customer, $data) {
            $service = Service::findOrFail($data['service_id']);

            $booking = Booking::create([
                'booking_number' => 'BKG-' . strtoupper(Str::random(8)),
                'customer_id' => $customer->id,
                'service_id' => $service->id,
                'status' => BookingStatus::Pending->value,
                'total_price' => $service->base_price, // Or custom calculation
                'address' => $data['address'],
                'city' => $data['city'],
                'scheduled_at' => $data['scheduled_at'] ?? null,
                'notes' => $data['notes'] ?? null,
                'issue_images' => $data['issue_images'] ?? null,
            ]);

            event(new BookingCreated($booking));

            // Initial history record
            event(new BookingStatusUpdated($booking, '', BookingStatus::Pending->value, $customer, 'Booking created'));

            return $booking;
        });
    }

    /**
     * Assign a technician to a booking (admin action).
     */
    public function assignTechnician(Booking $booking, User $technician, User $admin): Booking
    {
        $booking->update([
            'technician_id' => $technician->id,
        ]);

        return $booking;
    }

    /**
     * Technician accepts a booking with optimistic locking.
     */
    public function acceptBooking(Booking $booking, User $technician): Booking
    {
        BookingStateMachine::assertCanTransition($booking->status, BookingStatus::Accepted->value);

        // Atomic update to ensure optimistic locking
        $updated = Booking::where('id', $booking->id)
            ->where('status', BookingStatus::Pending->value)
            ->whereNull('technician_id')
            ->update([
                'status' => BookingStatus::Accepted->value,
                'technician_id' => $technician->id,
            ]);

        if (!$updated) {
            throw new \Exception('Booking was already accepted or is no longer pending.');
        }

        $booking->refresh();

        event(new BookingAccepted($booking));
        event(new BookingStatusUpdated($booking, BookingStatus::Pending->value, BookingStatus::Accepted->value, $technician, 'Booking accepted via optimistic lock'));

        return $booking;
    }

    /**
     * Update the status of a booking, ensuring state machine validity.
     */
    public function updateStatus(Booking $booking, string $newStatus, User $actor, ?string $notes = null): Booking
    {
        BookingStateMachine::assertCanTransition($booking->status, $newStatus);

        $oldStatus = $booking->status;

        $updateData = ['status' => $newStatus];

        if ($newStatus === BookingStatus::InProgress->value && !$booking->started_at) {
            $updateData['started_at'] = now();
        } elseif ($newStatus === BookingStatus::Completed->value) {
            $updateData['completed_at'] = now();
        } elseif ($newStatus === BookingStatus::Cancelled->value) {
            $updateData['cancelled_at'] = now();
            $updateData['cancellation_reason'] = $notes;
        }

        $booking->update($updateData);

        event(new BookingStatusUpdated($booking, $oldStatus, $newStatus, $actor, $notes));

        return $booking;
    }
}

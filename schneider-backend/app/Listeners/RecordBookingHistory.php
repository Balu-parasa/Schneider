<?php

namespace App\Listeners;

use App\Events\BookingStatusUpdated;
use App\Models\BookingStatusHistory;
use Illuminate\Contracts\Queue\ShouldQueue;

class RecordBookingHistory implements ShouldQueue
{
    /**
     * Handle the event.
     */
    public function handle(BookingStatusUpdated $event): void
    {
        BookingStatusHistory::create([
            'booking_id' => $event->booking->id,
            'status' => $event->newStatus,
            'notes' => $event->notes,
            'created_by' => $event->actor?->id,
        ]);
    }
}

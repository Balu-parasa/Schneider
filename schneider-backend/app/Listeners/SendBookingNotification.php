<?php

namespace App\Listeners;

use App\Events\BookingStatusUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendBookingNotification implements ShouldQueue
{
    /**
     * Handle the event.
     */
    public function handle(BookingStatusUpdated $event): void
    {
        // Here we would typically dispatch a notification class to the relevant user
        // e.g. $event->booking->customer->notify(new BookingStatusChangedNotification($event->booking));
        
        // For MVP, we are setting up the structure.
    }
}

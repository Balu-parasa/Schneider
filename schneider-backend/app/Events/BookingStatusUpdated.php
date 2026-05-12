<?php

namespace App\Events;

use App\Models\Booking;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BookingStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Booking $booking;
    public string $oldStatus;
    public string $newStatus;
    public ?User $actor;
    public ?string $notes;

    /**
     * Create a new event instance.
     */
    public function __construct(Booking $booking, string $oldStatus, string $newStatus, ?User $actor = null, ?string $notes = null)
    {
        $this->booking = $booking;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
        $this->actor = $actor;
        $this->notes = $notes;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('private-bookings.' . $this->booking->id),
            new PrivateChannel('private-user.' . $this->booking->customer_id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'booking.status_updated';
    }

    /**
     * Get the data to broadcast.
     * Minimal payload.
     */
    public function broadcastWith(): array
    {
        return [
            'booking_id' => $this->booking->id,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'notes' => $this->notes,
        ];
    }
}

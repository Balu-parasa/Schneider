<?php

namespace App\Events;

use App\Models\TechnicianLocation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TechnicianLocationUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public TechnicianLocation $location;
    public ?string $bookingId;

    /**
     * Create a new event instance.
     */
    public function __construct(TechnicianLocation $location, ?string $bookingId = null)
    {
        $this->location = $location;
        $this->bookingId = $bookingId;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [
            new PresenceChannel('presence-technicians'),
        ];

        if ($this->bookingId) {
            $channels[] = new PrivateChannel('private-bookings.' . $this->bookingId);
        }

        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'technician.location_updated';
    }

    /**
     * Get the data to broadcast.
     * Minimal payload.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'technician_id' => $this->location->technician_id,
            'latitude' => $this->location->latitude,
            'longitude' => $this->location->longitude,
            'heading' => $this->location->heading,
            'speed' => $this->location->speed,
        ];
    }
}

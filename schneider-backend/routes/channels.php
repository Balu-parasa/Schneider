<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Booking;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (string) $user->id === (string) $id;
});

// Private channel for specific bookings
Broadcast::channel('private-bookings.{bookingId}', function ($user, $bookingId) {
    $booking = Booking::find($bookingId);
    if (!$booking) {
        return false;
    }
    
    return $user->id === $booking->customer_id 
        || $user->id === $booking->technician_id 
        || $user->hasRole('admin');
});

// Presence channel for online technicians
Broadcast::channel('presence-technicians', function ($user) {
    if ($user->hasRole('technician')) {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'avatar' => $user->avatar,
        ];
    }
    
    // Admins can also join to see who is online, but maybe don't broadcast their presence
    if ($user->hasRole('admin')) {
        return [
            'id' => $user->id,
            'is_admin' => true,
        ];
    }
    
    return false;
});

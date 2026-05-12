<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\TechnicianLocation;
use App\Events\TechnicianLocationUpdated;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class TechnicianLocationController extends Controller
{
    use ApiResponses;

    /**
     * Update technician's current location.
     */
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'heading' => ['nullable', 'integer', 'between:0,360'],
            'speed' => ['nullable', 'integer', 'min:0'],
            'booking_id' => ['nullable', 'uuid', 'exists:bookings,id'],
        ]);

        $technician = $request->user();

        // 1. Create historical record
        $location = TechnicianLocation::create([
            'technician_id' => $technician->id,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'heading' => $request->heading,
            'speed' => $request->speed,
            'recorded_at' => now(),
        ]);

        // 2. Cache latest location for quick reads
        $cacheKey = "technician:{$technician->id}:location";
        Cache::put($cacheKey, [
            'latitude' => $location->latitude,
            'longitude' => $location->longitude,
            'heading' => $location->heading,
            'speed' => $location->speed,
            'recorded_at' => clone $location->recorded_at,
        ], now()->addHours(2));

        // 3. Broadcast update
        event(new TechnicianLocationUpdated($location, $request->booking_id));

        return $this->success(null, 'Location updated');
    }

    /**
     * Get a technician's latest cached location.
     */
    public function latest(string $technicianId): JsonResponse
    {
        $location = Cache::get("technician:{$technicianId}:location");

        if (!$location) {
            $location = TechnicianLocation::where('technician_id', $technicianId)
                ->latest('recorded_at')
                ->first();

            if (!$location) {
                return $this->error('Location not found', 404);
            }

            // Repopulate cache
            Cache::put("technician:{$technicianId}:location", [
                'latitude' => $location->latitude,
                'longitude' => $location->longitude,
                'heading' => $location->heading,
                'speed' => $location->speed,
                'recorded_at' => clone $location->recorded_at,
            ], now()->addHours(2));
        }

        return $this->success($location);
    }
}

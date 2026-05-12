<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\UpdateBookingStatusRequest;
use App\Http\Resources\BookingResource;
use App\Services\BookingService;
use App\Models\Booking;
use App\Enums\BookingStatus;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TechnicianBookingController extends Controller
{
    use ApiResponses;

    protected BookingService $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    /**
     * View all pending bookings available for assignment (if auto-assignment is off).
     * For MVP, we said Admin assigns, but tech can view their assigned ones.
     */
    public function index(Request $request): JsonResponse
    {
        $bookings = Booking::with(['service', 'customer'])
            ->where('technician_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return $this->success(BookingResource::collection($bookings)->response()->getData(true));
    }

    /**
     * Technician accepts a pending booking.
     */
    public function accept(Request $request, Booking $booking): JsonResponse
    {
        try {
            $booking = $this->bookingService->acceptBooking($booking, $request->user());
            return $this->success(new BookingResource($booking), 'Booking accepted');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    /**
     * Update the status of an assigned booking.
     */
    public function updateStatus(UpdateBookingStatusRequest $request, Booking $booking): JsonResponse
    {
        if ($booking->technician_id !== $request->user()->id) {
            abort(403);
        }

        try {
            $booking = $this->bookingService->updateStatus(
                $booking,
                $request->validated('status'),
                $request->user(),
                $request->validated('notes')
            );
            return $this->success(new BookingResource($booking), 'Status updated');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 422);
        }
    }
}

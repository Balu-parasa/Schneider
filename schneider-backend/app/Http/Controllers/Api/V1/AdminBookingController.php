<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\AssignTechnicianRequest;
use App\Http\Resources\BookingResource;
use App\Services\BookingService;
use App\Models\Booking;
use App\Models\User;
use App\Enums\BookingStatus;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminBookingController extends Controller
{
    use ApiResponses;

    protected BookingService $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    /**
     * Get all bookings for admin dashboard.
     */
    public function index(): JsonResponse
    {
        $bookings = Booking::with(['service', 'customer', 'technician'])->latest()->paginate(20);

        return $this->success(BookingResource::collection($bookings)->response()->getData(true));
    }

    /**
     * Assign a technician to a booking.
     */
    public function assign(AssignTechnicianRequest $request, Booking $booking): JsonResponse
    {
        $technician = User::findOrFail($request->validated('technician_id'));

        $booking = $this->bookingService->assignTechnician($booking, $technician, $request->user());

        return $this->success(new BookingResource($booking), 'Technician assigned successfully');
    }

    /**
     * Admin cancels a booking.
     */
    public function cancel(Request $request, Booking $booking): JsonResponse
    {
        $request->validate(['cancellation_reason' => 'required|string']);

        try {
            $booking = $this->bookingService->updateStatus(
                $booking,
                BookingStatus::Cancelled->value,
                $request->user(),
                $request->input('cancellation_reason')
            );
            return $this->success(new BookingResource($booking), 'Booking cancelled by admin');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 422);
        }
    }
}

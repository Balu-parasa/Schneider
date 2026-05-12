<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\StoreBookingRequest;
use App\Http\Resources\BookingResource;
use App\Services\BookingService;
use App\Models\Booking;
use App\Traits\ApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerBookingController extends Controller
{
    use ApiResponses;

    protected BookingService $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    /**
     * Display a listing of customer's bookings.
     */
    public function index(Request $request): JsonResponse
    {
        $bookings = Booking::with(['service', 'technician'])
            ->where('customer_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return $this->success(BookingResource::collection($bookings)->response()->getData(true));
    }

    /**
     * Store a newly created booking in storage.
     */
    public function store(StoreBookingRequest $request): JsonResponse
    {
        $booking = $this->bookingService->createBooking($request->user(), $request->validated());

        return $this->created(new BookingResource($booking->load('service')), 'Booking created successfully');
    }

    /**
     * Display the specified booking.
     */
    public function show(Request $request, Booking $booking): JsonResponse
    {
        if ($booking->customer_id !== $request->user()->id) {
            abort(403);
        }

        return $this->success(new BookingResource($booking->load(['service', 'technician', 'statusHistories'])));
    }
}

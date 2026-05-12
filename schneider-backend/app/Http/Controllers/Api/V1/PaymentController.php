<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Services\PaymentSimulatorService;
use App\Traits\ApiResponses;
use Exception;

class PaymentController extends Controller
{
    use ApiResponses;

    protected PaymentSimulatorService $paymentService;

    public function __construct(PaymentSimulatorService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function simulate(Request $request, Booking $booking)
    {
        // Security check
        if ($booking->customer_id !== $request->user()->id) {
            return $this->error('Unauthorized', 403);
        }

        if ($booking->status !== 'in_progress') {
            return $this->error('Only bookings in progress can be paid for.', 400);
        }

        try {
            $transaction = $this->paymentService->processMockPayment($booking, $request->all());
            return $this->success($transaction, 'Payment processed successfully.');
        } catch (Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function downloadInvoice(Request $request, Booking $booking)
    {
        // Security check
        if ($booking->customer_id !== $request->user()->id) {
            return $this->error('Unauthorized', 403);
        }

        $invoice = $booking->invoice;
        
        if (!$invoice || !$invoice->pdf_path) {
            return $this->error('Invoice not generated yet.', 404);
        }

        $filePath = storage_path('app/' . $invoice->pdf_path);
        
        if (!file_exists($filePath)) {
            return $this->error('Invoice file not found.', 404);
        }

        return response()->download($filePath, $invoice->invoice_number . '.pdf');
    }
}

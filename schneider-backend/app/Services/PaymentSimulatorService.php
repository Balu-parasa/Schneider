<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Transaction;
use App\Enums\PaymentStatus;
use Illuminate\Support\Str;
use Exception;

class PaymentSimulatorService extends BaseService
{
    /**
     * Simulate a payment processing flow.
     */
    public function processMockPayment(Booking $booking, array $paymentDetails): Transaction
    {
        // 1. Calculate costs (Base price + Tax)
        $subtotal = (float) $booking->service->base_price;
        $tax = round($subtotal * 0.08, 2); // 8% tax
        $total = $subtotal + $tax;

        // 2. Simulate 10% chance of random failure for demo purposes
        $isSuccess = rand(1, 100) > 10;
        
        $status = $isSuccess ? PaymentStatus::Paid->value : PaymentStatus::Failed->value;
        $mockTransactionId = 'txn_mock_' . Str::random(12);

        // 3. Create the Transaction Record
        $transaction = Transaction::create([
            'booking_id' => $booking->id,
            'user_id' => $booking->customer_id,
            'amount' => $total,
            'currency' => 'USD',
            'payment_id' => $mockTransactionId,
            'status' => $status,
            'metadata' => [
                'card_last4' => substr($paymentDetails['card_number'] ?? '4242', -4),
                'simulated' => true,
            ],
        ]);

        if (!$isSuccess) {
            throw new Exception("Simulated Payment Failed. Insufficient funds or network error.");
        }

        // 4. If Success, process business logic
        
        // Update booking status
        $booking->update(['status' => 'completed']);
        
        // Distribute Commission
        $commissionService = app(CommissionService::class);
        $earnings = $commissionService->distributeEarnings($booking, $subtotal); // Distribute only subtotal

        // Generate Invoice
        $invoiceService = app(InvoiceService::class);
        $invoiceService->generateInvoiceForBooking(
            $booking, 
            $subtotal, 
            $tax, 
            $earnings['platform_fee'], 
            $total
        );

        return $transaction;
    }
}

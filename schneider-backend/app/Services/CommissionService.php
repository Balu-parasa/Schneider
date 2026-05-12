<?php

namespace App\Services;

use App\Models\Booking;

class CommissionService extends BaseService
{
    /**
     * Calculate and distribute earnings for a completed booking.
     */
    public function distributeEarnings(Booking $booking, float $totalPaid): array
    {
        // 20% platform fee, 80% to technician
        $platformFeePercent = 0.20;
        
        $platformFee = round($totalPaid * $platformFeePercent, 2);
        $technicianEarnings = round($totalPaid - $platformFee, 2);

        if ($booking->technician_id) {
            $walletService = app(WalletService::class);
            $walletService->credit(
                $booking->technician_id,
                $technicianEarnings,
                'booking',
                $booking->id,
                "Earnings for booking {$booking->booking_number}"
            );
        }

        return [
            'platform_fee' => $platformFee,
            'technician_earnings' => $technicianEarnings,
            'total_paid' => $totalPaid,
        ];
    }
}

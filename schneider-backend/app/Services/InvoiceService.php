<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Booking;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class InvoiceService extends BaseService
{
    public function generateInvoiceForBooking(Booking $booking, float $subtotal, float $tax, float $platformFee, float $total): Invoice
    {
        $invoiceNumber = 'INV-' . strtoupper(Str::random(8));

        $invoice = Invoice::create([
            'invoice_number' => $invoiceNumber,
            'booking_id' => $booking->id,
            'user_id' => $booking->customer_id,
            'subtotal' => $subtotal,
            'tax' => $tax,
            'platform_fee' => $platformFee,
            'total' => $total,
            'status' => 'paid',
        ]);

        // Generate PDF
        $pdf = Pdf::loadView('pdf.invoice', ['invoice' => $invoice]);
        
        $fileName = "invoices/{$invoiceNumber}.pdf";
        Storage::disk('local')->put($fileName, $pdf->output());

        $invoice->update(['pdf_path' => $fileName]);

        return $invoice;
    }
}

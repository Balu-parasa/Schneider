<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Transaction;
use App\Models\User;
use App\Traits\ApiResponses;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminAnalyticsController extends Controller
{
    use ApiResponses;

    public function kpis()
    {
        $today = Carbon::today();
        
        $totalRevenue = Transaction::where('status', 'paid')->sum('amount');
        $activeBookings = Booking::whereIn('status', ['accepted', 'in_progress'])->count();
        $totalTechnicians = User::role('technician')->count();
        $todayBookings = Booking::whereDate('created_at', $today)->count();

        return $this->success([
            'total_revenue' => $totalRevenue,
            'active_bookings' => $activeBookings,
            'total_technicians' => $totalTechnicians,
            'today_bookings' => $todayBookings,
        ]);
    }

    public function revenueChart()
    {
        // Last 7 days revenue
        $revenue = Transaction::where('status', 'paid')
            ->where('created_at', '>=', Carbon::now()->subDays(6)->startOfDay())
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(amount) as total'))
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get();

        // Format for Recharts
        $formatted = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $record = $revenue->firstWhere('date', $date);
            $formatted[] = [
                'name' => Carbon::now()->subDays($i)->format('D'), // Mon, Tue
                'revenue' => $record ? (float) $record->total : 0,
            ];
        }

        return $this->success($formatted);
    }
}

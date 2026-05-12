<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TechnicianLocation;
use Carbon\Carbon;

class PruneTechnicianLocations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'locations:prune {--days=30 : The number of days of history to retain}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Prune historical technician locations older than the specified days';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = $this->option('days');
        $cutoff = Carbon::now()->subDays($days);

        $this->info("Pruning technician locations recorded before {$cutoff->toDateTimeString()}...");

        $deleted = TechnicianLocation::where('recorded_at', '<', $cutoff)->delete();

        $this->info("Successfully pruned {$deleted} historical location records.");
    }
}

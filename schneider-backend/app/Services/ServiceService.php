<?php

namespace App\Services;

use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Database\Eloquent\Collection;

class ServiceService extends BaseService
{
    /**
     * Get all active services with their categories.
     */
    public function getActiveServices(): Collection
    {
        return Service::with('category')->where('is_active', true)->get();
    }

    /**
     * Get all service categories.
     */
    public function getCategories(): Collection
    {
        return ServiceCategory::where('is_active', true)->get();
    }
}

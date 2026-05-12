<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ServiceService;
use App\Http\Resources\ServiceResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ServiceController extends Controller
{
    protected ServiceService $serviceService;

    public function __construct(ServiceService $serviceService)
    {
        $this->serviceService = $serviceService;
    }

    /**
     * Get a list of all active services.
     */
    public function index(): AnonymousResourceCollection
    {
        $services = $this->serviceService->getActiveServices();
        return ServiceResource::collection($services);
    }
}

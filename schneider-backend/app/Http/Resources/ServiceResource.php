<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'icon' => $this->icon,
            'base_price' => $this->base_price,
            'emergency_price' => $this->emergency_price,
            'estimated_duration' => $this->estimated_duration,
            'pricing_type' => $this->pricing_type,
            'is_active' => $this->is_active,
            'category' => $this->whenLoaded('category'),
            'created_at' => $this->created_at,
        ];
    }
}

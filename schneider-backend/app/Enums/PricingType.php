<?php

namespace App\Enums;

enum PricingType: string
{
    case Fixed = 'fixed';
    case Hourly = 'hourly';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

<?php

namespace App\Enums;

enum PriorityLevel: string
{
    case Low = 'low';
    case Normal = 'normal';
    case High = 'high';
    case Urgent = 'urgent';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

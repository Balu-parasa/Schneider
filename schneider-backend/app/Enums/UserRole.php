<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Technician = 'technician';
    case Customer = 'customer';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

<?php

namespace App\Services;

use App\Enums\BookingStatus;
use Exception;

class BookingStateMachine
{
    /**
     * Define valid state transitions.
     * key: current state
     * value: array of allowed next states
     */
    protected static array $transitions = [
        'pending' => ['accepted', 'cancelled', 'rejected'],
        'accepted' => ['in_progress', 'cancelled'],
        'in_progress' => ['completed', 'cancelled'],
        'completed' => [],
        'cancelled' => [],
        'rejected' => [],
    ];

    /**
     * Check if a transition is valid.
     *
     * @param BookingStatus|string $current
     * @param BookingStatus|string $next
     * @return bool
     */
    public static function canTransition($current, $next): bool
    {
        $currentValue = $current instanceof BookingStatus ? $current->value : $current;
        $nextValue = $next instanceof BookingStatus ? $next->value : $next;

        if (!isset(self::$transitions[$currentValue])) {
            return false;
        }

        return in_array($nextValue, self::$transitions[$currentValue], true);
    }

    /**
     * Assert that a transition is valid, throw an exception otherwise.
     *
     * @param BookingStatus|string $current
     * @param BookingStatus|string $next
     * @throws Exception
     */
    public static function assertCanTransition($current, $next): void
    {
        if (!self::canTransition($current, $next)) {
            $currentValue = $current instanceof BookingStatus ? $current->value : $current;
            $nextValue = $next instanceof BookingStatus ? $next->value : $next;
            throw new Exception("Invalid booking status transition from {$currentValue} to {$nextValue}.");
        }
    }
}

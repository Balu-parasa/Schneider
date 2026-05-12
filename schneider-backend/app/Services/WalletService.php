<?php

namespace App\Services;

use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use App\Enums\TransactionType;
use Exception;

class WalletService extends BaseService
{
    public function credit(string $userId, float $amount, string $referenceType = null, string $referenceId = null, string $description = null): WalletTransaction
    {
        return DB::transaction(function () use ($userId, $amount, $referenceType, $referenceId, $description) {
            $wallet = Wallet::firstOrCreate(['user_id' => $userId]);
            
            // Atomic update to avoid race conditions
            $wallet->increment('balance', $amount);
            
            return $wallet->transactions()->create([
                'type' => TransactionType::Credit->value,
                'amount' => $amount,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'description' => $description,
            ]);
        });
    }

    public function debit(string $userId, float $amount, string $referenceType = null, string $referenceId = null, string $description = null): WalletTransaction
    {
        return DB::transaction(function () use ($userId, $amount, $referenceType, $referenceId, $description) {
            $wallet = Wallet::firstOrCreate(['user_id' => $userId]);
            
            if ($wallet->balance < $amount) {
                throw new Exception('Insufficient wallet balance.');
            }
            
            // Atomic update
            $wallet->decrement('balance', $amount);
            
            return $wallet->transactions()->create([
                'type' => TransactionType::Debit->value,
                'amount' => $amount,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'description' => $description,
            ]);
        });
    }

    public function getBalance(string $userId): float
    {
        $wallet = Wallet::firstOrCreate(['user_id' => $userId]);
        return (float) $wallet->balance;
    }
}

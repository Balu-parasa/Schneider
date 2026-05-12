<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\Payout;
use App\Traits\ApiResponses;

class WalletController extends Controller
{
    use ApiResponses;

    public function getBalance(Request $request)
    {
        $wallet = Wallet::firstOrCreate(['user_id' => $request->user()->id]);
        
        $transactions = WalletTransaction::where('wallet_id', $wallet->id)
            ->latest()
            ->limit(20)
            ->get();

        return $this->success([
            'balance' => $wallet->balance,
            'transactions' => $transactions
        ]);
    }

    public function withdraw(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:10',
            'bank_account' => 'required|string',
        ]);

        $wallet = Wallet::firstOrCreate(['user_id' => $request->user()->id]);

        if ($wallet->balance < $request->amount) {
            return $this->error('Insufficient balance', 400);
        }

        // Create pending payout request
        $payout = Payout::create([
            'user_id' => $request->user()->id,
            'amount' => $request->amount,
            'bank_account_info' => $request->bank_account,
            'status' => 'pending',
        ]);

        return $this->success($payout, 'Withdrawal request submitted successfully.');
    }
}

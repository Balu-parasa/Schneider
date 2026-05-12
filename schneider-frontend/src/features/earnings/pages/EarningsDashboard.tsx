import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowUpRight, ArrowDownRight, Wallet, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const EarningsDashboard = () => {
  const { data: walletData, isLoading, refetch } = useQuery({
    queryKey: ['technician-wallet'],
    queryFn: async () => {
      const response = await axios.get('/api/v1/technician/wallet');
      return response.data.data;
    },
  });

  const handleWithdraw = async () => {
    try {
      await axios.post('/api/v1/technician/wallet/withdraw', {
        amount: walletData.balance,
        bank_account: 'mock_bank_1234',
      });
      toast.success('Withdrawal request submitted successfully.');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Withdrawal failed.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 p-6 md:p-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Earnings Dashboard</h1>
          <p className="text-muted-foreground">Manage your wallet and payouts.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="glass shadow-lg border-primary/20 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">${walletData?.balance || '0.00'}</div>
              <p className="text-xs text-muted-foreground mt-1">Ready for withdrawal</p>
              
              <Button 
                className="w-full mt-4" 
                onClick={handleWithdraw}
                disabled={!walletData || parseFloat(walletData.balance) < 10}
              >
                Withdraw Funds
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5" />
              Transaction History
            </CardTitle>
            <CardDescription>Your recent earnings and withdrawals.</CardDescription>
          </CardHeader>
          <CardContent>
            {walletData?.transactions?.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No transactions found.
              </div>
            ) : (
              <div className="space-y-4">
                {walletData?.transactions?.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {tx.type === 'credit' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm capitalize">{tx.type === 'credit' ? 'Earning' : 'Withdrawal'}</p>
                        <p className="text-xs text-muted-foreground">{tx.description || tx.reference_type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.type === 'credit' ? 'text-green-600 dark:text-green-400' : ''}`}>
                        {tx.type === 'credit' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

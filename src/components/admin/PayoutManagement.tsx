import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Users, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface PayoutData {
  id: string;
  trainer_id: string;
  booking_id: string;
  gross_amount: number;
  platform_commission: number;
  net_amount: number;
  payout_status: string;
  created_at: string;
  paid_at: string | null;
  trainers: {
    name: string;
    user_id: string;
    profiles: {
      email: string;
      full_name: string;
    };
  };
  bookings: {
    training_topic: string;
    start_time: string;
  };
}

interface PayoutBatch {
  id: string;
  batch_name: string;
  total_amount: number;
  trainer_count: number;
  payout_count: number;
  status: string;
  created_at: string;
  processed_at: string | null;
}

const PayoutManagement = () => {
  const [selectedPayouts, setSelectedPayouts] = useState<string[]>([]);
  const [batchName, setBatchName] = useState('');
  const [batchNotes, setBatchNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending payouts
  const { data: pendingPayouts, isLoading: payoutsLoading } = useQuery({
    queryKey: ['admin-pending-payouts'],
    queryFn: async (): Promise<PayoutData[]> => {
      const { data, error } = await supabase
        .from('trainer_payouts')
        .select(`
          *,
          trainers!inner (
            name,
            user_id,
            profiles!inner (
              email,
              full_name
            )
          ),
          bookings!inner (
            training_topic,
            start_time
          )
        `)
        .eq('payout_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch payout batches
  const { data: payoutBatches, isLoading: batchesLoading } = useQuery({
    queryKey: ['admin-payout-batches'],
    queryFn: async (): Promise<PayoutBatch[]> => {
      const { data, error } = await supabase
        .from('payout_batches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    }
  });

  // Create payout batch mutation
  const createBatchMutation = useMutation({
    mutationFn: async ({ payoutIds, batchName, notes }: { 
      payoutIds: string[], 
      batchName: string, 
      notes: string 
    }) => {
      // Calculate batch totals
      const selectedPayoutData = pendingPayouts?.filter(p => payoutIds.includes(p.id)) || [];
      const totalAmount = selectedPayoutData.reduce((sum, p) => sum + p.net_amount, 0);
      const trainerIds = [...new Set(selectedPayoutData.map(p => p.trainer_id))];

      // Create batch
      const { data: batch, error: batchError } = await supabase
        .from('payout_batches')
        .insert({
          batch_name: batchName,
          total_amount: totalAmount,
          trainer_count: trainerIds.length,
          payout_count: payoutIds.length,
          notes: notes
        })
        .select()
        .single();

      if (batchError) throw batchError;

      // Update payouts with batch ID
      const { error: updateError } = await supabase
        .from('trainer_payouts')
        .update({ payout_batch_id: batch.id })
        .in('id', payoutIds);

      if (updateError) throw updateError;

      return batch;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payout batch created successfully"
      });
      setSelectedPayouts([]);
      setBatchName('');
      setBatchNotes('');
      queryClient.invalidateQueries({ queryKey: ['admin-pending-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payout-batches'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create payout batch",
        variant: "destructive"
      });
      console.error('Error creating batch:', error);
    }
  });

  // Mark batch as paid mutation
  const markBatchPaidMutation = useMutation({
    mutationFn: async (batchId: string) => {
      // Update batch status
      const { error: batchError } = await supabase
        .from('payout_batches')
        .update({ 
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', batchId);

      if (batchError) throw batchError;

      // Update all payouts in the batch
      const { error: payoutsError } = await supabase
        .from('trainer_payouts')
        .update({ 
          payout_status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('payout_batch_id', batchId);

      if (payoutsError) throw payoutsError;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Batch marked as paid"
      });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payout-batches'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark batch as paid",
        variant: "destructive"
      });
      console.error('Error marking batch paid:', error);
    }
  });

  const handleSelectPayout = (payoutId: string) => {
    setSelectedPayouts(prev => 
      prev.includes(payoutId) 
        ? prev.filter(id => id !== payoutId)
        : [...prev, payoutId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPayouts.length === pendingPayouts?.length) {
      setSelectedPayouts([]);
    } else {
      setSelectedPayouts(pendingPayouts?.map(p => p.id) || []);
    }
  };

  const selectedAmount = pendingPayouts?.filter(p => selectedPayouts.includes(p.id))
    .reduce((sum, p) => sum + p.net_amount, 0) || 0;

  const selectedTrainerCount = [...new Set(
    pendingPayouts?.filter(p => selectedPayouts.includes(p.id))
      .map(p => p.trainer_id) || []
  )].length;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Pending Amount</p>
                <p className="text-xl font-bold">
                  ₹{pendingPayouts?.reduce((sum, p) => sum + p.net_amount, 0).toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Pending Payouts</p>
                <p className="text-xl font-bold">{pendingPayouts?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Selected Amount</p>
                <p className="text-xl font-bold text-purple-600">₹{selectedAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Selected Trainers</p>
                <p className="text-xl font-bold">{selectedTrainerCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              disabled={selectedPayouts.length === 0}
              className="flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Create Payout Batch ({selectedPayouts.length})
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Payout Batch</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Batch Summary:</p>
                <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                  <p><strong>Payouts:</strong> {selectedPayouts.length}</p>
                  <p><strong>Trainers:</strong> {selectedTrainerCount}</p>
                  <p><strong>Total Amount:</strong> ₹{selectedAmount.toFixed(2)}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Batch Name</label>
                <Input
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder={`Payout Batch - ${format(new Date(), 'MMM dd, yyyy')}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                <Textarea
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  placeholder="Add any notes about this payout batch..."
                />
              </div>
              <Button
                onClick={() => createBatchMutation.mutate({
                  payoutIds: selectedPayouts,
                  batchName: batchName || `Payout Batch - ${format(new Date(), 'MMM dd, yyyy')}`,
                  notes: batchNotes
                })}
                disabled={createBatchMutation.isPending}
                className="w-full"
              >
                {createBatchMutation.isPending ? 'Creating...' : 'Create Batch'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Payouts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedPayouts.length === pendingPayouts?.length && pendingPayouts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </TableHead>
                  <TableHead>Trainer</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Gross Amount</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Net Payout</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading payouts...
                    </TableCell>
                  </TableRow>
                ) : pendingPayouts?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No pending payouts
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingPayouts?.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedPayouts.includes(payout.id)}
                          onChange={() => handleSelectPayout(payout.id)}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payout.trainers.name}</div>
                          <div className="text-sm text-gray-500">{payout.trainers.profiles.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payout.bookings.training_topic}</div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(payout.bookings.start_time), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>₹{payout.gross_amount.toFixed(2)}</TableCell>
                      <TableCell className="text-red-600">-₹{payout.platform_commission.toFixed(2)}</TableCell>
                      <TableCell className="font-medium text-green-600">₹{payout.net_amount.toFixed(2)}</TableCell>
                      <TableCell>{format(new Date(payout.created_at), 'MMM dd, yyyy')}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payout Batches */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payout Batches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Trainers</TableHead>
                  <TableHead>Payouts</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batchesLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading batches...
                    </TableCell>
                  </TableRow>
                ) : payoutBatches?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No payout batches yet
                    </TableCell>
                  </TableRow>
                ) : (
                  payoutBatches?.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">{batch.batch_name}</TableCell>
                      <TableCell>₹{batch.total_amount.toFixed(2)}</TableCell>
                      <TableCell>{batch.trainer_count}</TableCell>
                      <TableCell>{batch.payout_count}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(batch.status)}>
                          {batch.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(batch.created_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        {batch.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => markBatchPaidMutation.mutate(batch.id)}
                            disabled={markBatchPaidMutation.isPending}
                          >
                            Mark as Paid
                          </Button>
                        )}
                        {batch.status === 'completed' && batch.processed_at && (
                          <span className="text-sm text-green-600">
                            Paid {format(new Date(batch.processed_at), 'MMM dd')}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayoutManagement;
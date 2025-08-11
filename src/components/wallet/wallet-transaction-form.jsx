import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/auth-context';

const CASH_REASONS = {
  inflow: [
    'Initial Cash Setup',
    'Bank Withdrawal',
    'Cash Sales',
    'Petty Cash Replenishment',
    'Customer Payment',
    'Other Income'
  ],
  outflow: [
    'Office Supplies',
    'Transportation',
    'Meals & Entertainment',
    'Utilities Payment',
    'Emergency Expenses',
    'Bank Deposit',
    'Other Expenses'
  ]
};

export default function WalletTransactionForm({ 
  open, 
  onOpenChange, 
  onSubmit, 
  type, 
  title 
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    amount: '',
    reason: '',
    customReason: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const isOtherSelected = formData.reason === 'Other Income' || formData.reason === 'Other Expenses';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
        reason: isOtherSelected && formData.customReason ? formData.customReason : formData.reason,
        performedBy: user?.name || user?.email
      });
      
      // Reset form
      setFormData({
        amount: '',
        reason: '',
        customReason: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error submitting transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Select 
              value={formData.reason} 
              onValueChange={(value) => {
                handleChange('reason', value);
                // Clear custom reason when switching away from "Other"
                if (value !== 'Other Income' && value !== 'Other Expenses') {
                  handleChange('customReason', '');
                }
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {CASH_REASONS[type].map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isOtherSelected && (
              <div className="mt-2">
                <Label htmlFor="customReason">Specify Reason *</Label>
                <Input
                  id="customReason"
                  type="text"
                  placeholder="Enter the reason for this transaction"
                  value={formData.customReason}
                  onChange={(e) => handleChange('customReason', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Additional notes..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.amount || !formData.reason || (isOtherSelected && !formData.customReason)}
              className={type === 'inflow' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {loading ? 'Processing...' : (type === 'inflow' ? 'Add Cash' : 'Withdraw Cash')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

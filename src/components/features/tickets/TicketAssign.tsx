'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  contractorService,
  type AssignableContractor,
} from '@/lib/services/contractorService';

interface TicketAssignProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (contractorId: string) => Promise<void>;
  currentAssigneeId?: string;
  ticketNumber: string;
}

export function TicketAssign({
  isOpen,
  onClose,
  onAssign,
  currentAssigneeId,
  ticketNumber,
}: TicketAssignProps) {
  const [assigneeId, setAssigneeId] = useState<string>(currentAssigneeId ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contractors, setContractors] = useState<AssignableContractor[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setAssigneeId(currentAssigneeId ?? '');
    setIsLoading(true);

    const loadAssignableContractors = async () => {
      try {
        const options = await contractorService.listAssignableContractors();
        setContractors(options);
      } catch (error) {
        console.error('Failed to load assignable contractors:', error);
        toast.error('Unable to load assignable contractors.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadAssignableContractors();
  }, [currentAssigneeId, isOpen]);

  const handleSubmit = async () => {
    if (!assigneeId) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onAssign(assigneeId);
      onClose();
    } catch (error) {
      console.error('Ticket assignment failed:', error);
      toast.error('Ticket assignment failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Ticket {ticketNumber}</DialogTitle>
          <DialogDescription>
            Select an eligible contractor for this ticket.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contractor" className="text-right">
              Assign To
            </Label>
            <Select value={assigneeId} onValueChange={setAssigneeId} disabled={isLoading}>
              <SelectTrigger className="col-span-3" id="contractor">
                <SelectValue placeholder={isLoading ? 'Loading...' : 'Select contractor'} />
              </SelectTrigger>
              <SelectContent>
                {contractors.map((contractor) => (
                  <SelectItem key={contractor.id} value={contractor.id}>
                    {contractor.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!assigneeId || isSubmitting}>
            {isSubmitting ? 'Assigning...' : 'Assign Ticket'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

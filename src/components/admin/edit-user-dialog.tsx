'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { User, BusinessUnit, UserRole } from '@/lib/types';
import { useState, useEffect } from 'react';

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  businessUnits: BusinessUnit[];
  onSave: (updatedData: {
    role: UserRole;
    businessUnitId: string;
  }) => Promise<void>;
  isSaving: boolean;
}

export function EditUserDialog({
  isOpen,
  onClose,
  user,
  businessUnits,
  onSave,
  isSaving,
}: EditUserDialogProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('employee');
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState<string>('');

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role || 'employee');
      setSelectedBusinessUnit(user.businessUnitId || '');
    }
  }, [user]);

  const handleSave = () => {
    onSave({
      role: selectedRole,
      businessUnitId: selectedBusinessUnit,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User: {user.displayName || user.email}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as UserRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessUnit">Business Unit</Label>
            <Select
              value={selectedBusinessUnit}
              onValueChange={setSelectedBusinessUnit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a business unit" />
              </SelectTrigger>
              <SelectContent>
                {businessUnits.map((bu) => (
                  <SelectItem key={bu.id} value={bu.id}>
                    {bu.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

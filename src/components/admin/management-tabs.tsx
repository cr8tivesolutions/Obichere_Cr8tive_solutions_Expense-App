'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User, BusinessUnit, UserRole } from '@/lib/types';
import { useCollection } from '@/firebase/firestore/use-collection';
import {
  collection,
  query,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  addDoc,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { EditUserDialog } from '@/components/admin/edit-user-dialog';
import { useMemoFirebase } from '@/firebase/firestore/use-memo-firebase';
import { useToast } from '@/components/ui/use-toast';

export function ManagementTabs() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState('');
  const [selectedManagerBU, setSelectedManagerBU] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [newBusinessUnit, setNewBusinessUnit] = useState('');
  const [isCreatingBU, setIsCreatingBU] = useState(false);

  const firestore = useFirestore();
  const { toast } = useToast();

  const usersQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'users')) : null),
    [firestore]
  );
  const { data: users, isLoading: usersLoading } = useCollection<User>(
    usersQuery
  );

  const businessUnitsQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'businessUnits')) : null),
    [firestore]
  );
  const { data: businessUnits, isLoading: businessUnitsLoading } =
    useCollection<BusinessUnit>(businessUnitsQuery);

  const managerRolesQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'manager_roles')) : null),
    [firestore]
  );
  const { data: managerRoles, isLoading: managerRolesLoading } =
    useCollection(managerRolesQuery);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsEditDialogOpen(false);
    setSelectedUser(null);
  };

  const handleSaveUser = async (updatedData: {
    role: UserRole;
    businessUnitId: string;
  }) => {
    if (!firestore || !selectedUser) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred.',
      });
      return;
    }
    setIsSavingUser(true);
    try {
      const userRef = doc(firestore, 'users', selectedUser.uid);
      await updateDoc(userRef, {
        role: updatedData.role,
        businessUnitId: updatedData.businessUnitId,
      });
      toast({
        title: 'Success',
        description: 'User updated successfully.',
      });
      handleDialogClose();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error updating user',
        description: error.message,
      });
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleAssignManager = async () => {
    if (!firestore || !selectedManager || !selectedManagerBU) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a user and a business unit.',
      });
      return;
    }
    setIsAssigning(true);
    try {
      const managerRef = doc(
        firestore,
        `manager_roles/${selectedManagerBU}_${selectedManager}`
      );
      await setDoc(managerRef, {
        userId: selectedManager,
        businessUnitId: selectedManagerBU,
      });
      toast({
        title: 'Success',
        description: 'Manager assigned successfully.',
      });
      setSelectedManager('');
      setSelectedManagerBU('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error assigning manager',
        description: error.message,
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveManager = async (roleId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'manager_roles', roleId));
      toast({
        title: 'Success',
        description: 'Manager role removed.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error removing manager',
        description: error.message,
      });
    }
  };

  const handleCreateBusinessUnit = async () => {
    if (!firestore || !newBusinessUnit.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Business unit name cannot be empty.',
      });
      return;
    }
    setIsCreatingBU(true);
    try {
      await addDoc(collection(firestore, 'businessUnits'), {
        name: newBusinessUnit.trim(),
      });
      toast({
        title: 'Success',
        description: 'Business unit created.',
      });
      setNewBusinessUnit('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error creating business unit',
        description: error.message,
      });
    } finally {
      setIsCreatingBU(false);
    }
  };

  const managers =
    managerRoles
      ?.map((role) => {
        const user = users?.find((u) => u.uid === role.userId);
        const businessUnit = businessUnits?.find(
          (bu) => bu.id === role.businessUnitId
        );
        return {
          id: role.id,
          userName: user?.displayName || user?.email,
          businessUnitName: businessUnit?.name,
        };
      })
      .filter((m) => m.userName && m.businessUnitName) || [];

  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="manager-roles">Manager Roles</TabsTrigger>
        <TabsTrigger value="business-units">Business Units</TabsTrigger>
      </TabsList>
      <TabsContent value="users">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              View and manage user roles and business units.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <p>Loading users...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Business Unit</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell>{user.displayName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        {
                          businessUnits?.find(
                            (bu) => bu.id === user.businessUnitId
                          )?.name
                        }
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(user)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="manager-roles">
        <Card>
          <CardHeader>
            <CardTitle>Manager Role Assignment</CardTitle>
            <CardDescription>
              Assign manager roles to users for specific business units.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-end space-x-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="user-select">User</Label>
                <Select
                  value={selectedManager}
                  onValueChange={setSelectedManager}
                >
                  <SelectTrigger id="user-select">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      ?.filter((u) => u && u.role === 'manager')
                      .map((user) => (
                        <SelectItem key={user.uid} value={user.uid}>
                          {user.displayName || user.email}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex-1">
                <Label htmlFor="bu-select">Business Unit</Label>
                <Select
                  value={selectedManagerBU}
                  onValueChange={setSelectedManagerBU}
                >
                  <SelectTrigger id="bu-select">
                    <SelectValue placeholder="Select a business unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessUnits?.map((bu) => (
                      <SelectItem key={bu.id} value={bu.id}>
                        {bu.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAssignManager} disabled={isAssigning}>
                {isAssigning ? 'Assigning...' : 'Assign Manager'}
              </Button>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-medium">Current Managers</h3>
              {managerRolesLoading ? (
                <p>Loading managers...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Manager</TableHead>
                      <TableHead>Business Unit</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {managers.map((manager) => (
                      <TableRow key={manager.id}>
                        <TableCell>{manager.userName}</TableCell>
                        <TableCell>{manager.businessUnitName}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveManager(manager.id!)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="business-units">
        <Card>
          <CardHeader>
            <CardTitle>Business Unit Management</CardTitle>
            <CardDescription>
              Add or manage business units for your organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-end space-x-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="bu-name">New Business Unit Name</Label>
                <Input
                  id="bu-name"
                  value={newBusinessUnit}
                  onChange={(e) => setNewBusinessUnit(e.target.value)}
                  placeholder="e.g., Marketing, Engineering"
                />
              </div>
              <Button onClick={handleCreateBusinessUnit} disabled={isCreatingBU}>
                {isCreatingBU ? 'Creating...' : 'Create Business Unit'}
              </Button>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-medium">
                Existing Business Units
              </h3>
              {businessUnitsLoading ? (
                <p>Loading business units...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {businessUnits?.map((bu) => (
                      <TableRow key={bu.id}>
                        <TableCell>{bu.name}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {selectedUser && businessUnits && (
        <EditUserDialog
          isOpen={isEditDialogOpen}
          onClose={handleDialogClose}
          user={selectedUser}
          businessUnits={businessUnits}
          onSave={handleSaveUser}
          isSaving={isSavingUser}
        />
      )}
    </Tabs>
  );
}

    
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
import { User, BusinessUnit } from '@/lib/types';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, query } from 'firebase/firestore';
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
import { ManagerRolesTab } from '@/components/admin/manager-roles-tab';
import { useMemoFirebase } from '@/firebase/firestore/use-memo-firebase';

export function ManagementTabs() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const firestore = useFirestore();

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

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsEditDialogOpen(false);
    setSelectedUser(null);
  };

  return (
    <Tabs defaultValue="users">
      <TabsList>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="manager-roles">Manager Roles</TabsTrigger>
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
        <ManagerRolesTab
          users={users || []}
          businessUnits={businessUnits || []}
        />
      </TabsContent>

      {selectedUser && businessUnits && (
        <EditUserDialog
          isOpen={isEditDialogOpen}
          onClose={handleDialogClose}
          user={selectedUser}
          businessUnits={businessUnits}
        />
      )}
    </Tabs>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

export function UserAddDialog() {
  const { addUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'user' as 'admin' | 'user'
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.username.length < 3) {
      setError('Логин должен содержать минимум 3 символа');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    const success = addUser(formData.username, formData.password, formData.name, formData.role);
    
    if (success) {
      setFormData({ username: '', password: '', name: '', role: 'user' });
      setOpen(false);
    } else {
      setError('Пользователь с таким логином уже существует');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Icon name="UserPlus" size={18} />
          Добавить пользователя
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новый пользователь</DialogTitle>
          <DialogDescription>Создание нового пользователя системы</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">ФИО</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Иванов Иван Иванович"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Логин</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="ivanov"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Минимум 6 символов"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Роль</Label>
            <Select value={formData.role} onValueChange={(value: 'admin' | 'user') => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Пользователь</SelectItem>
                <SelectItem value="admin">Администратор</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm flex items-center gap-2">
              <Icon name="AlertCircle" size={16} />
              {error}
            </div>
          )}
          <Button type="submit" className="w-full">Создать пользователя</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function UsersTable() {
  const { users, deleteUser } = useAuth();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (userId: string) => {
    const success = deleteUser(userId);
    if (!success) {
      alert('Невозможно удалить главного администратора');
    }
    setDeleteConfirm(null);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ФИО</TableHead>
          <TableHead>Логин</TableHead>
          <TableHead>Роль</TableHead>
          <TableHead className="text-right">Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>
              <code className="bg-muted px-2 py-1 rounded text-sm">{user.username}</code>
            </TableCell>
            <TableCell>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="gap-1">
                <Icon name={user.role === 'admin' ? 'Shield' : 'User'} size={14} />
                {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {user.id !== '1' ? (
                <Dialog open={deleteConfirm === user.id} onOpenChange={(open) => setDeleteConfirm(open ? user.id : null)}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-2">
                      <Icon name="Trash2" size={16} />
                      Удалить
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Подтверждение удаления</DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground">
                      Вы уверены, что хотите удалить пользователя <strong>{user.name}</strong>?
                    </p>
                    <div className="flex gap-3 justify-end mt-4">
                      <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                        Отмена
                      </Button>
                      <Button variant="destructive" onClick={() => handleDelete(user.id)}>
                        Удалить
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Badge variant="outline">Системный</Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
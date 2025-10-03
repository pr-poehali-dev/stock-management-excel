import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (login(username, password)) {
      setUsername('');
      setPassword('');
    } else {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-2">
            <Icon name="Package" className="text-white" size={24} />
          </div>
          <CardTitle className="text-2xl font-bold">Складской учёт</CardTitle>
          <CardDescription>Войдите в систему для продолжения</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Логин</label>
              <Input
                type="text"
                placeholder="Введите логин"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Пароль</label>
              <Input
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm flex items-center gap-2">
                <Icon name="AlertCircle" size={16} />
                {error}
              </div>
            )}
            <Button type="submit" className="w-full">
              Войти
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t space-y-2">
            <p className="text-sm text-muted-foreground text-center mb-3">Демо-аккаунты:</p>
            <div className="space-y-2 text-sm">
              <div className="bg-muted p-3 rounded-md">
                <div className="font-medium flex items-center gap-2">
                  <Icon name="Shield" size={16} className="text-primary" />
                  Администратор
                </div>
                <div className="text-muted-foreground mt-1">
                  Логин: <span className="font-mono">admin</span> / Пароль: <span className="font-mono">admin123</span>
                </div>
              </div>
              <div className="bg-muted p-3 rounded-md">
                <div className="font-medium flex items-center gap-2">
                  <Icon name="User" size={16} className="text-blue-600" />
                  Пользователь
                </div>
                <div className="text-muted-foreground mt-1">
                  Логин: <span className="font-mono">user</span> / Пароль: <span className="font-mono">user123</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

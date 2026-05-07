import { useState } from 'react';
import { Moon, Sun, Save } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/store/auth';
import { useTheme } from '@/context/ThemeContext';
import { getInitials } from '@/lib/utils';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPw(true);
    try {
      await api.put('/auth/password', pw);
      toast.success('Password updated');
      setPw({ currentPassword: '', newPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveProfile} className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={form.avatar} />
                    <AvatarFallback className="text-base">{getInitials(form.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input
                      id="avatar"
                      value={form.avatar}
                      onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                      placeholder="https://example.com/avatar.png"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email} disabled />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    rows={3}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="A short description about you"
                    maxLength={200}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="gradient" disabled={savingProfile}>
                    <Save className="h-3.5 w-3.5" /> {savingProfile ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Update your password regularly.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={savePassword} className="space-y-4 max-w-sm">
                <div className="space-y-1.5">
                  <Label htmlFor="cur">Current password</Label>
                  <Input
                    id="cur"
                    type="password"
                    value={pw.currentPassword}
                    onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new">New password</Label>
                  <Input
                    id="new"
                    type="password"
                    value={pw.newPassword}
                    onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
                    minLength={6}
                    required
                  />
                </div>
                <Button type="submit" variant="gradient" disabled={savingPw}>
                  <Save className="h-3.5 w-3.5" /> {savingPw ? 'Saving…' : 'Update password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Choose between light and dark mode.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition ${
                    theme === 'light' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <Sun className="h-6 w-6" />
                  <span className="text-sm font-medium">Light</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition ${
                    theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <Moon className="h-6 w-6" />
                  <span className="text-sm font-medium">Dark</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

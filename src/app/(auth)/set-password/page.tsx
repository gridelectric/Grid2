import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SetPasswordForm } from '@/components/features/auth/SetPasswordForm';

export const metadata: Metadata = {
  title: 'Set Password - Grid Electric Services',
  description: 'Set your permanent account password',
};

export default function SetPasswordPage() {
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">G</span>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Set your password</CardTitle>
        <CardDescription>
          You need to set a permanent password before accessing the app.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SetPasswordForm />
      </CardContent>
    </Card>
  );
}

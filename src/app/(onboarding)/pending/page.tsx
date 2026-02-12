'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Mail, HelpCircle, Zap, CheckCircle } from 'lucide-react';

export default function PendingPage() {
  const router = useRouter();

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      {/* Success Icon */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-200">
            <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#002168]">
            Application Submitted!
          </h1>
          <p className="text-gray-600 mt-2">
            Thank you for completing your contractor profile
          </p>
        </div>
      </div>

      {/* Status Card */}
      <Card className="border-gray-100 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-[#2ea3f2]" />
          </div>
          <CardTitle className="text-xl text-[#002168]">Under Review</CardTitle>
          <CardDescription>
            Our team is reviewing your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Application Received</p>
                <p className="text-xs text-gray-500">Your profile has been submitted successfully</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#2ea3f2] flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
                <Clock className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Under Review</p>
                <p className="text-xs text-gray-500">Typically takes 24-48 hours</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Decision Email</p>
                <p className="text-xs text-gray-400">You&apos;ll receive an email with next steps</p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              We&apos;ll send you an email once your application has been reviewed.
              If approved, you&apos;ll be able to start accepting assignments immediately.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="border-gray-100 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-3">
                If you have questions about your application or need to update information, our support team is here to help.
              </p>
              <Button 
                variant="outline" 
                className="border-[#2ea3f2] text-[#2ea3f2] hover:bg-blue-50"
                onClick={() => window.open('mailto:support@gridelectriccorp.com')}
              >
                Contact Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center">
        <Button 
          variant="ghost" 
          className="text-gray-500"
          onClick={() => router.push('/login')}
        >
          Return to Login
        </Button>
      </div>
    </div>
  );
}

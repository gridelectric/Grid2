'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Shield, Clock, DollarSign, Zap, ArrowRight, Users, Award } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();

  const benefits = [
    {
      icon: DollarSign,
      title: 'Competitive Pay',
      description: 'Earn $75-125/hour based on work type and experience',
      color: 'green',
    },
    {
      icon: Clock,
      title: 'Flexible Schedule',
      description: 'Choose assignments that fit your availability',
      color: 'blue',
    },
    {
      icon: Shield,
      title: 'Insurance Coverage',
      description: 'We verify all contractors are properly insured',
      color: 'purple',
    },
    {
      icon: CheckCircle,
      title: 'Quick Onboarding',
      description: 'Get approved and start working within 48 hours',
      color: 'orange',
    },
  ];

  const values = [
    { icon: Users, text: 'Join our network of certified professionals' },
    { icon: Award, text: 'Work with leading utility companies' },
    { icon: Zap, text: 'Help restore power during emergencies' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#002168] to-[#2ea3f2] shadow-xl shadow-blue-200">
            <Zap className="w-12 h-12 text-white" fill="white" />
          </div>
        </div>
        
        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-[#002168] tracking-tight">
            Welcome to Grid Electric
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Join our network of damage assessment professionals and help restore power to communities in need
          </p>
        </div>

        {/* Values */}
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          {values.map((value, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm"
            >
              <value.icon className="w-4 h-4 text-[#2ea3f2]" />
              <span className="text-sm text-gray-600">{value.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {benefits.map((benefit, index) => (
          <Card 
            key={index}
            className="group hover:shadow-lg hover:border-blue-100 transition-all duration-300 border-gray-100"
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div 
                  className={`
                    w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                    ${benefit.color === 'green' && 'bg-emerald-50 text-emerald-600'}
                    ${benefit.color === 'blue' && 'bg-blue-50 text-[#2ea3f2]'}
                    ${benefit.color === 'purple' && 'bg-purple-50 text-purple-600'}
                    ${benefit.color === 'orange' && 'bg-amber-50 text-amber-600'}
                  `}
                >
                  <benefit.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#002168] transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* What to Expect */}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#002168]">What to Expect</CardTitle>
          <CardDescription>
            The onboarding process takes about 15-20 minutes to complete
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { step: 1, text: 'Personal and business information' },
              { step: 2, text: 'Insurance certificate uploads' },
              { step: 3, text: 'Professional credentials and licenses' },
              { step: 4, text: 'Banking information for direct deposit' },
              { step: 5, text: 'Safety training video and quiz' },
              { step: 6, text: 'Profile review and approval' },
            ].map((item) => (
              <div 
                key={item.step}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2ea3f2] to-[#0693e3] text-white text-sm font-semibold flex items-center justify-center shadow-sm">
                  {item.step}
                </div>
                <span className="text-gray-700 text-sm group-hover:text-gray-900">{item.text}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button 
          size="lg" 
          className="w-full sm:w-auto sm:flex-1 h-12 text-base font-semibold bg-gradient-to-r from-[#002168] to-[#2ea3f2] hover:from-[#001545] hover:to-[#1a8fd9] shadow-lg shadow-blue-200 transition-all"
          onClick={() => router.push('/personal-info')}
        >
          Get Started
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="w-full sm:w-auto h-12 text-base border-gray-300 hover:bg-gray-50 hover:border-gray-400"
          onClick={() => router.push('/login')}
        >
          Already have an account? Sign in
        </Button>
      </div>
    </div>
  );
}

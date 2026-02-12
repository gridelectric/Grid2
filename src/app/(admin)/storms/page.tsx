'use client';

import { CloudRain, Edit, Plus } from 'lucide-react';
import { PageHeader } from '@/components/common/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/providers/AuthProvider';
import { canPerformManagementAction } from '@/lib/auth/authorization';

const mockStorms = [
  { id: 'storm-1', name: 'Tropical System Alpha', status: 'ACTIVE', region: 'North District' },
  { id: 'storm-2', name: 'Wind Event Bravo', status: 'PLANNED', region: 'Central District' },
];

export default function StormsPage() {
  const { profile } = useAuth();
  const canManageStormProjects = canPerformManagementAction(profile?.role, 'storm_project_write');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Storm Projects"
        description="View active and planned storm operations."
      >
        <Button
          disabled={!canManageStormProjects}
          title={canManageStormProjects ? 'Create storm project' : 'Only Super Admin can create storm projects'}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Storm Project
        </Button>
      </PageHeader>

      {!canManageStormProjects && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Admin users can view storm projects, but create/edit actions are restricted to Super Admin.
        </div>
      )}

      <div className="grid gap-4">
        {mockStorms.map((storm) => (
          <Card key={storm.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CloudRain className="h-5 w-5 text-blue-600" />
                {storm.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                <p>Status: {storm.status}</p>
                <p>Region: {storm.region}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={!canManageStormProjects}
                title={canManageStormProjects ? 'Edit storm project' : 'Only Super Admin can edit storm projects'}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, Lock, PlayCircle, ChevronDown, ChevronUp, ExternalLink, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

// Training content configuration
interface TrainingItem {
  id: string;
  type: 'form' | 'video';
  title: string;
  description: string;
  topics: string[];
  url?: string;
  youtubeId?: string;
}

const TRAINING_ITEMS: TrainingItem[] = [
  {
    id: 'item-1',
    type: 'form',
    title: 'Training Module Form',
    url: 'https://bit.ly/3YNm1Gh',
    description: 'Complete the Microsoft Teams training form to begin your onboarding',
    topics: ['Complete required training questions', 'Acknowledge safety protocols', 'Confirm understanding of procedures'],
  },
  {
    id: 'item-2',
    type: 'video',
    title: 'Contractor Onboarding – Administrative',
    youtubeId: '6UeKTMIlkG8',
    description: 'Administrative requirements, documentation, and compliance',
    topics: ['Paperwork and documentation standards', 'Billing and invoicing procedures', 'Compliance requirements'],
  },
  {
    id: 'item-3',
    type: 'video',
    title: 'Field Orientation',
    youtubeId: 'jh_kj5-B3bA',
    description: 'Field operations, equipment, and on-site procedures',
    topics: ['Equipment handling and inspection', 'Photo documentation standards', 'Emergency contact protocols'],
  },
];

interface ItemProgress {
  [itemId: string]: {
    completed: boolean;
    progress: number;
  };
}

export function TrainingForm() {
  const { data, updateData, nextStep, prevStep, saveDraft } = useOnboarding();
  const [itemProgress, setItemProgress] = useState<ItemProgress>(() => {
    // Initialize from saved data if available
    const saved = data.trainingVideosCompleted;
    if (saved) {
      return TRAINING_ITEMS.reduce((acc, item, index) => {
        acc[item.id] = {
          completed: saved[index] || false,
          progress: saved[index] ? 100 : 0,
        };
        return acc;
      }, {} as ItemProgress);
    }
    return TRAINING_ITEMS.reduce((acc, item) => {
      acc[item.id] = { completed: false, progress: 0 };
      return acc;
    }, {} as ItemProgress);
  });
  const [acknowledged, setAcknowledged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>('item-1');

  // Calculate overall progress
  const completedItems = Object.values(itemProgress).filter((v) => v.completed).length;
  const overallProgress = (completedItems / TRAINING_ITEMS.length) * 100;
  const allItemsCompleted = completedItems === TRAINING_ITEMS.length;

  // Determine which items are unlocked
  const isItemUnlocked = useCallback(
    (index: number) => {
      if (index === 0) return true;
      // Item is unlocked if all previous items are completed
      for (let i = 0; i < index; i++) {
        if (!itemProgress[TRAINING_ITEMS[i].id]?.completed) {
          return false;
        }
      }
      return true;
    },
    [itemProgress]
  );

  const handleItemComplete = (itemId: string) => {
    setItemProgress((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], completed: true, progress: 100 },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const completedArray = TRAINING_ITEMS.map((item) => itemProgress[item.id]?.completed || false);
      updateData({
        trainingCompleted: true,
        trainingVideosCompleted: completedArray,
      });
      await saveDraft();
      nextStep();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const completedArray = TRAINING_ITEMS.map((item) => itemProgress[item.id]?.completed || false);
      updateData({
        trainingVideosCompleted: completedArray,
      });
      await saveDraft();
    } finally {
      setIsSaving(false);
    }
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-blue-900">Training Progress</span>
          <span className="text-sm font-medium text-blue-700">
            {completedItems} of {TRAINING_ITEMS.length} items completed
          </span>
        </div>
        <Progress value={overallProgress} className="h-3 bg-blue-200" />
        <p className="text-sm text-blue-700 mt-2">
          Complete all items in sequence to finish your training.
        </p>
      </Card>

      {/* Item List */}
      <div className="space-y-4">
        {TRAINING_ITEMS.map((item, index) => {
          const isUnlocked = isItemUnlocked(index);
          const isCompleted = itemProgress[item.id]?.completed;
          const isExpanded = expandedItem === item.id;

          return (
            <Card
              key={item.id}
              className={cn(
                'overflow-hidden transition-all duration-200',
                !isUnlocked && 'opacity-60',
                isCompleted && 'border-green-300 bg-green-50/30'
              )}
            >
              {/* Item Header */}
              <button
                type="button"
                onClick={() => isUnlocked && toggleExpand(item.id)}
                disabled={!isUnlocked}
                className={cn(
                  'w-full p-4 flex items-center gap-4 text-left',
                  isUnlocked && 'hover:bg-slate-50 cursor-pointer',
                  !isUnlocked && 'cursor-not-allowed'
                )}
              >
                {/* Status Icon */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                    isCompleted
                      ? 'bg-green-100 text-green-600'
                      : isUnlocked
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-slate-100 text-slate-400'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : item.type === 'form' ? (
                    <FileText className="w-5 h-5" />
                  ) : isUnlocked ? (
                    <PlayCircle className="w-5 h-5" />
                  ) : (
                    <Lock className="w-5 h-5" />
                  )}
                </div>

                {/* Item Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-500">Step {index + 1}</span>
                    {item.type === 'form' && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Form</span>
                    )}
                    {item.type === 'video' && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Video</span>
                    )}
                    {isCompleted && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Completed
                      </span>
                    )}
                  </div>
                  <h4 className={cn('font-semibold', !isUnlocked && 'text-slate-400')}>
                    {item.title}
                  </h4>
                  <p className="text-sm text-slate-500 truncate">{item.description}</p>
                </div>

                {/* Expand/Collapse Icon */}
                {isUnlocked && (
                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                )}
              </button>

              {/* Expanded Content */}
              {isExpanded && isUnlocked && (
                <div className="border-t">
                  {/* Form Content */}
                  {item.type === 'form' && item.url && (
                    <div className="p-6 bg-slate-50">
                      <div className="bg-white rounded-lg p-6 border-2 border-dashed border-slate-300 text-center">
                        <FileText className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                        <h5 className="font-medium text-lg mb-2">Microsoft Teams Form</h5>
                        <p className="text-sm text-slate-500 mb-4">
                          Complete the training module form in Microsoft Teams before proceeding to the videos.
                        </p>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                        >
                          Open Form
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Video Content */}
                  {item.type === 'video' && item.youtubeId && (
                    <>
                      {/* YouTube Embed */}
                      <div className="aspect-video bg-slate-900">
                        <iframe
                          src={`https://www.youtube.com/embed/${item.youtubeId}?enablejsapi=1&rel=0&modestbranding=1`}
                          title={item.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </>
                  )}

                  {/* Topics */}
                  <div className="p-4 bg-slate-50">
                    <h5 className="font-medium text-sm mb-3">This covers:</h5>
                    <ul className="space-y-2">
                      {item.topics.map((topic: string, topicIndex: number) => (
                        <li key={topicIndex} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Mark Complete Button */}
                  {!isCompleted && (
                    <div className="p-4 border-t bg-white">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleItemComplete(item.id)}
                        className="w-full"
                      >
                        {item.type === 'form' ? 'I\'ve completed this form' : 'I\'ve watched this video'}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Locked State */}
              {!isUnlocked && (
                <div className="px-4 pb-4">
                  <div className="bg-slate-100 rounded-lg p-4 text-center">
                    <Lock className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">
                      Complete Step {index} to unlock
                    </p>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Acknowledgment */}
      <div
        className={cn(
          'flex items-start gap-3 p-4 border rounded-lg transition-opacity',
          allItemsCompleted ? 'opacity-100' : 'opacity-50 pointer-events-none'
        )}
      >
        <Checkbox
          id="training-ack"
          checked={acknowledged}
          onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
          disabled={!allItemsCompleted}
        />
        <div className="space-y-1">
          <Label htmlFor="training-ack" className="font-medium cursor-pointer">
            I have completed all training requirements
          </Label>
          <p className="text-sm text-slate-500">
            I have completed the training form and watched all videos. I understand the safety protocols, administrative requirements, and field procedures, and will follow all guidelines when conducting damage assessments.
          </p>
        </div>
      </div>

      {!allItemsCompleted && (
        <p className="text-sm text-amber-600">Please complete all training items before continuing.</p>
      )}

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={prevStep}>
          Back
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={handleSaveDraft}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Draft'
          )}
        </Button>
        <Button
          type="button"
          className="w-full sm:w-auto sm:ml-auto"
          disabled={!allItemsCompleted || !acknowledged || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Continuing...
            </>
          ) : (
            'Continue'
          )}
        </Button>
      </div>
    </div>
  );
}

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  commonTicketCreateSchema,
  COMMON_SOURCE_TYPE,
  COMMON_TICKET_PRIORITY,
  COMMON_TICKET_STATUS,
  type TicketTemplateDefinition,
  type TicketTemplateFieldConfig,
} from '@/lib/tickets/templates';

interface StormHeaderSummary {
  id: string;
  name: string;
  utilityClient: string;
  state: string;
}

interface TicketFormRendererProps {
  storm: StormHeaderSummary;
  template: TicketTemplateDefinition;
  onSubmitTicket: (values: Record<string, unknown>) => Promise<void>;
  onRunOcr: (rawText: string) => void;
  confidenceByField?: Record<string, number>;
  extractionWarnings?: string[];
  isSubmitting?: boolean;
  initialValues?: Record<string, unknown>;
}

function getFieldDefault(field: TicketTemplateFieldConfig): unknown {
  if (field.controlType === 'toggle') return false;
  return '';
}

function toFieldName(name: string): string {
  return name;
}

export function TicketFormRenderer({
  storm,
  template,
  onSubmitTicket,
  onRunOcr,
  confidenceByField,
  extractionWarnings,
  isSubmitting = false,
  initialValues,
}: TicketFormRendererProps) {
  const combinedSchema = useMemo(() => commonTicketCreateSchema.and(template.schema), [template]);

  const defaultValues = useMemo(() => {
    const templateDefaults = Object.fromEntries(
      template.fieldConfig.map((field) => [field.fieldKey, getFieldDefault(field)]),
    );

    return {
      status: 'DRAFT',
      priority: 'C',
      source_type: 'MANUAL',
      source_file_id: '',
      raw_ocr_text: '',
      ...templateDefaults,
      ...(template.defaultValues as Record<string, unknown>),
      ...(initialValues ?? {}),
    };
  }, [initialValues, template]);

  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(combinedSchema as z.ZodTypeAny),
    defaultValues,
    values: defaultValues,
  });

  const sections = useMemo(() => {
    const map = new Map<string, TicketTemplateFieldConfig[]>();
    for (const field of template.fieldConfig) {
      const current = map.get(field.section) ?? [];
      current.push(field);
      map.set(field.section, current);
    }
    return Array.from(map.entries());
  }, [template.fieldConfig]);

  return (
    <div className="space-y-6">
      <div className="storm-surface rounded-xl border p-4 text-sm">
        <div className="grid gap-2 md:grid-cols-2">
          <p><span className="font-semibold">Storm:</span> {storm.name}</p>
          <p><span className="font-semibold">Utility:</span> {storm.utilityClient}</p>
          <p><span className="font-semibold">State:</span> {storm.state}</p>
          <p><span className="font-semibold">Storm ID:</span> <span className="font-mono text-xs">{storm.id}</span></p>
        </div>
      </div>

      <Form {...form}>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit(async (values) => {
            await onSubmitTicket(values);
          })}
        >
          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={String(field.value ?? '')} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {COMMON_TICKET_STATUS.map((item) => (<SelectItem key={item} value={item}>{item}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select value={String(field.value ?? '')} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {COMMON_TICKET_PRIORITY.map((item) => (<SelectItem key={item} value={item}>{item}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="source_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source Type</FormLabel>
                  <Select value={String(field.value ?? '')} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {COMMON_SOURCE_TYPE.map((item) => (<SelectItem key={item} value={item}>{item}</SelectItem>))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="rounded-xl border p-4">
            <p className="mb-3 text-sm font-semibold">OCR Intake</p>
            <FormField
              control={form.control}
              name="raw_ocr_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OCR Text</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Paste OCR output here, then click Extract" {...field} value={String(field.value ?? '')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onRunOcr(String(form.getValues('raw_ocr_text') ?? ''))}
              >
                Extract Fields
              </Button>
            </div>
            {extractionWarnings?.length ? (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-amber-700">
                {extractionWarnings.map((warning) => (<li key={warning}>{warning}</li>))}
              </ul>
            ) : null}
          </div>

          {sections.map(([section, fields]) => (
            <div key={section} className="rounded-xl border p-4">
              <h3 className="mb-3 text-sm font-semibold">{section}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {fields.map((fieldConfig) => {
                  const isLowConfidence = (confidenceByField?.[fieldConfig.fieldKey] ?? 1) < 0.8;
                  return (
                    <FormField
                      key={fieldConfig.fieldKey}
                      control={form.control}
                      name={toFieldName(fieldConfig.fieldKey)}
                      render={({ field }) => {
                        const currentValue = field.value;

                        return (
                          <FormItem>
                            <FormLabel>
                              {fieldConfig.label}
                              {fieldConfig.required ? ' *' : ''}
                            </FormLabel>
                            <FormControl>
                              {fieldConfig.controlType === 'textarea' ? (
                                <Textarea {...field} value={String(currentValue ?? '')} />
                              ) : null}
                              {fieldConfig.controlType === 'select' ? (
                                <Select value={String(currentValue ?? '')} onValueChange={field.onChange}>
                                  <SelectTrigger><SelectValue placeholder={`Select ${fieldConfig.label}`} /></SelectTrigger>
                                  <SelectContent>
                                    {(fieldConfig.enumValues ?? []).map((item) => (<SelectItem key={item} value={item}>{item}</SelectItem>))}
                                  </SelectContent>
                                </Select>
                              ) : null}
                              {fieldConfig.controlType === 'toggle' ? (
                                <div className="flex items-center gap-2 rounded-md border p-2">
                                  <Checkbox checked={Boolean(currentValue)} onCheckedChange={(checked) => field.onChange(checked === true)} />
                                  <span className="text-sm">{fieldConfig.helpText ?? fieldConfig.label}</span>
                                </div>
                              ) : null}
                              {fieldConfig.controlType === 'number' ? (
                                <Input
                                  type="number"
                                  value={typeof currentValue === 'number' ? currentValue : String(currentValue ?? '')}
                                  onChange={(event) => field.onChange(event.target.value === '' ? undefined : Number(event.target.value))}
                                />
                              ) : null}
                              {fieldConfig.controlType === 'datetime' ? (
                                <Input type="datetime-local" {...field} value={String(currentValue ?? '')} />
                              ) : null}
                              {fieldConfig.controlType === 'text' ? (
                                <Input {...field} value={String(currentValue ?? '')} />
                              ) : null}
                            </FormControl>
                            {isLowConfidence ? <p className="text-xs text-amber-700">Low OCR confidence. Verify this value.</p> : null}
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Create Ticket'}</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

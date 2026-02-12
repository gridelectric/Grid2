import { z } from 'zod';

import { emailSchema, phoneSchema } from '../utils/validators';

const nameField = (fieldName: string) =>
  z.string().trim().min(2, `${fieldName} is required`).max(100, `${fieldName} is too long`);

export const coreOnboardingProfileSchema = z.object({
  firstName: nameField('First name'),
  lastName: nameField('Last name'),
  email: emailSchema,
  phone: phoneSchema,
  emergencyContactName: nameField('Emergency contact name'),
  emergencyContactPhone: phoneSchema,
});

export type CoreOnboardingProfileInput = z.infer<typeof coreOnboardingProfileSchema>;

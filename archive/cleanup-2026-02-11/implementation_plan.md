# Implementation Plan: Remove Credentials Step from Onboarding

## [Overview]
Remove the third step of the onboarding flow where users upload company credentials, including the database table and all related relationships.

The credentials step ("/credentials") currently allows subcontractors to add professional licenses and certifications (Electrical License, OSHA 10/30, CPR/First Aid, Climber Certification, etc.). This step needs to be completely removed from the onboarding flow, along with the supporting database infrastructure. The step is currently step 5 in a 12-step onboarding process (index 4 in the ONBOARDING_STEPS array).

## [Types]
No type system changes required - the credentials types are local to the component being removed and not part of shared type definitions.

The credential types defined in CredentialsForm.tsx are:
- CredentialData interface with fields: type, name, number, issueDate, expirationDate
- These types are only used within the form component and do not need preservation

## [Files]
Six files need to be modified or removed to complete this task.

**Files to Delete:**
1. `app/(onboarding)/credentials/page.tsx` - The credentials page route component
2. `components/features/onboarding/CredentialsForm.tsx` - The credentials form component

**Files to Modify:**
3. `components/providers/OnboardingProvider.tsx` - Remove '/credentials' from ONBOARDING_STEPS array (currently at index 4) and remove credentials field from OnboardingData interface

4. `sql/02_core_tables.sql` - Remove the entire `subcontractor_credentials` table definition (lines containing CREATE TABLE subcontractor_credentials through associated indexes)

5. `sql/08_rls_policies.sql` - Remove RLS policies for subcontractor_credentials:
   - CREATE POLICY credentials_own
   - CREATE POLICY credentials_admin

6. `sql/09_triggers.sql` - Remove credential expiration trigger:
   - check_credential_expiration() function
   - credential_expiration_trigger

## [Functions]
Two functions need to be removed from the codebase.

**Functions to Remove:**
1. `check_credential_expiration()` - PostgreSQL trigger function in sql/09_triggers.sql
   - Purpose: Automatically updates credential status based on expiration date
   - Migration: Table is being dropped, so this function becomes obsolete

2. `CredentialsForm()` - React component in components/features/onboarding/CredentialsForm.tsx
   - Purpose: UI form for adding/editing credentials
   - Migration: Entire component removed as feature is discontinued

## [Classes]
No class modifications required. The codebase uses functional React components and does not have class-based implementations for the credentials feature.

## [Dependencies]
No dependency changes required. The credentials feature uses existing project dependencies (react-hook-form, zod, lucide-react) that are shared across other forms.

## [Testing]
Manual verification required to ensure onboarding flow navigation works correctly after step removal.

**Verification Steps:**
1. Navigate through onboarding flow and verify step indicator updates correctly
2. Verify "Back" and "Continue" navigation works between insurance (step 4) and banking (now step 5)
3. Verify URL routing - /credentials should return 404
4. Database verification - subcontractor_credentials table should not exist after migration

## [Implementation Order]
Execute changes in this order to maintain system integrity:

1. **Delete UI Components** - Remove the page and form components first
   - Delete `app/(onboarding)/credentials/page.tsx`
   - Delete `components/features/onboarding/CredentialsForm.tsx`

2. **Update Onboarding Provider** - Remove credentials from step flow and data structure
   - Remove '/credentials' from ONBOARDING_STEPS array
   - Remove credentials field from OnboardingData interface

3. **Update Database Schema** - Remove table and related database objects
   - Remove subcontractor_credentials table from sql/02_core_tables.sql
   - Remove RLS policies from sql/08_rls_policies.sql
   - Remove trigger function from sql/09_triggers.sql

4. **Verification** - Test the onboarding flow to ensure proper navigation
   - Verify step count reduced from 12 to 11
   - Verify navigation between insurance and banking works
   - Confirm /credentials route returns 404

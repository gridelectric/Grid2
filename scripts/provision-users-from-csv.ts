#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database';
import type { ProvisioningAdapter, ProvisioningRowOutcome } from '../src/lib/provisioning/userProvisioning';

interface CliOptions {
  filePath: string;
  apply: boolean;
}

interface AuthListUser {
  id: string;
  email: string | null;
}

const SUPPORTED_FLAGS = ['--file', '--apply', '--dry-run', '--help'] as const;

function printUsage(): void {
  console.log([
    'Usage:',
    '  node --experimental-strip-types scripts/provision-users-from-csv.ts --file <path> [--apply]',
    '',
    'Flags:',
    '  --file <path>   Required CSV file path',
    '  --apply         Execute writes (default is dry-run)',
    '  --dry-run       Explicit dry-run mode (default)',
    '  --help          Show this help output',
    '',
    'Required CSV headers:',
    '  first_name,last_name,email,role,temp_password',
  ].join('\n'));
}

function parseCliOptions(args: string[]): CliOptions {
  if (args.includes('--help')) {
    printUsage();
    process.exit(0);
  }

  for (const arg of args) {
    if (arg.startsWith('--') && !SUPPORTED_FLAGS.includes(arg as (typeof SUPPORTED_FLAGS)[number])) {
      throw new Error(`Unsupported flag: ${arg}`);
    }
  }

  const fileIndex = args.indexOf('--file');
  if (fileIndex === -1 || !args[fileIndex + 1]) {
    throw new Error('Missing required --file <path> argument.');
  }

  const apply = args.includes('--apply');
  return {
    filePath: args[fileIndex + 1],
    apply,
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

async function listAllAuthUsers(
  client: ReturnType<typeof createClient<Database>>
): Promise<Map<string, AuthListUser>> {
  const usersByEmail = new Map<string, AuthListUser>();
  let page = 1;
  const perPage = 200;

  for (;;) {
    const { data, error } = await client.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(`Failed to list auth users: ${error.message}`);
    }

    const users = (data?.users ?? []) as AuthListUser[];
    for (const user of users) {
      if (!user.email) {
        continue;
      }
      usersByEmail.set(user.email.toLowerCase(), user);
    }

    if (users.length < perPage) {
      break;
    }

    page += 1;
  }

  return usersByEmail;
}

function createProvisioningAdapter(
  client: ReturnType<typeof createClient<Database>>
): ProvisioningAdapter {
  let cachedAuthUsers: Map<string, AuthListUser> | null = null;

  const ensureAuthUsers = async (): Promise<Map<string, AuthListUser>> => {
    if (!cachedAuthUsers) {
      cachedAuthUsers = await listAllAuthUsers(client);
    }

    return cachedAuthUsers;
  };

  return {
    listSuperAdmins: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (client.from('profiles') as any)
        .select('id, email')
        .eq('role', 'SUPER_ADMIN');

      if (error) {
        throw new Error(`Failed to fetch SUPER_ADMIN profiles: ${error.message}`);
      }

      return (data ?? [])
        .filter((row: { email?: string | null }) => Boolean(row.email))
        .map((row: { id: string; email: string }) => ({
          id: row.id,
          email: row.email.toLowerCase(),
        }));
    },

    findAuthUserByEmail: async (email: string) => {
      const usersByEmail = await ensureAuthUsers();
      const user = usersByEmail.get(email.toLowerCase());
      if (!user || !user.email) {
        return null;
      }

      return {
        id: user.id,
        email: user.email.toLowerCase(),
      };
    },

    createAuthUser: async ({ email, tempPassword, firstName, lastName }) => {
      const { data, error } = await client.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
        },
      });

      if (error || !data.user) {
        throw new Error(`Failed to create auth user ${email}: ${error?.message ?? 'Unknown error'}`);
      }

      const createdUser = {
        id: data.user.id,
        email,
      };

      const usersByEmail = await ensureAuthUsers();
      usersByEmail.set(email.toLowerCase(), {
        id: createdUser.id,
        email: createdUser.email,
      });

      return createdUser;
    },

    updateAuthUser: async (userId, { email, tempPassword, firstName, lastName }) => {
      const { error } = await client.auth.admin.updateUserById(userId, {
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
        },
      });

      if (error) {
        throw new Error(`Failed to update auth user ${email}: ${error.message}`);
      }

      const usersByEmail = await ensureAuthUsers();
      usersByEmail.set(email.toLowerCase(), {
        id: userId,
        email,
      });
    },

    upsertProfile: async (profile) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (client.from('profiles') as any).upsert(
        {
          id: profile.id,
          email: profile.email,
          first_name: profile.firstName,
          last_name: profile.lastName,
          role: profile.role,
          is_active: true,
          is_email_verified: true,
          must_reset_password: profile.mustResetPassword,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );

      if (error) {
        throw new Error(`Failed to upsert profile ${profile.email}: ${error.message}`);
      }
    },

    upsertContractor: async ({ profileId, firstName, lastName, email }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contractorsTable = client.from('subcontractors') as any;
      const businessName = `${firstName} ${lastName}`.trim();

      const { data: existingContractor, error: existingError } = await contractorsTable
        .select('id')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (existingError) {
        throw new Error(`Failed to query contractor record ${email}: ${existingError.message}`);
      }

      if (existingContractor?.id) {
        const { error: updateError } = await contractorsTable
          .update({
            business_email: email,
            onboarding_status: 'APPROVED',
            is_eligible_for_assignment: true,
            eligibility_reason: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingContractor.id);

        if (updateError) {
          throw new Error(`Failed to update contractor record ${email}: ${updateError.message}`);
        }

        return;
      }

      const { error: insertError } = await contractorsTable.insert({
        profile_id: profileId,
        business_name: businessName || email,
        business_email: email,
        onboarding_status: 'APPROVED',
        is_eligible_for_assignment: true,
        eligibility_reason: null,
      });

      if (insertError) {
        throw new Error(`Failed to create contractor record ${email}: ${insertError.message}`);
      }
    },
  };
}

function formatOutcome(outcome: ProvisioningRowOutcome): string {
  if (outcome.status === 'failed') {
    return `  - line ${outcome.lineNumber} (${outcome.email}): FAILED - ${outcome.reason}`;
  }

  const modePrefix = outcome.mode === 'dry-run' ? 'WOULD ' : '';
  return `  - line ${outcome.lineNumber} (${outcome.email}): ${modePrefix}${outcome.status.toUpperCase()}`;
}

async function main(): Promise<void> {
  const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
  const provisioningModuleUrl = pathToFileURL(
    path.resolve(scriptDirectory, '../src/lib/provisioning/userProvisioning.ts'),
  ).href;
  const provisioningModule = (
    await import(provisioningModuleUrl)
  ) as typeof import('../src/lib/provisioning/userProvisioning');
  const {
    parseProvisioningCsv,
    runProvisioning,
    validateProvisioningRows,
  } = provisioningModule;

  const options = parseCliOptions(process.argv.slice(2));
  const absoluteFilePath = path.resolve(process.cwd(), options.filePath);
  const csvContent = await fs.readFile(absoluteFilePath, 'utf8');

  const parsedCsv = parseProvisioningCsv(csvContent);
  if (parsedCsv.errors.length > 0) {
    console.error('CSV parsing failed:');
    for (const error of parsedCsv.errors) {
      console.error(`  - ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  const validation = validateProvisioningRows(parsedCsv.rows);
  const supabase = createClient<Database>(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  );
  const adapter = createProvisioningAdapter(supabase);
  const runResult = await runProvisioning(validation.validRows, adapter, {
    apply: options.apply,
    warnings: validation.warnings,
  });

  const validationFailures: ProvisioningRowOutcome[] = validation.rowIssues.map((issue) => ({
    lineNumber: issue.lineNumber,
    email: issue.email ?? 'unknown',
    status: 'failed',
    mode: options.apply ? 'applied' : 'dry-run',
    reason: issue.reason,
  }));

  const allOutcomes = [...validationFailures, ...runResult.outcomes]
    .sort((left, right) => left.lineNumber - right.lineNumber);
  const totalFailed = runResult.failedRows + validationFailures.length;

  console.log(`Provisioning mode: ${runResult.dryRun ? 'DRY RUN' : 'APPLY'}`);
  console.log(`Source file: ${absoluteFilePath}`);
  console.log(`Rows parsed: ${parsedCsv.rows.length}`);
  console.log(`Rows valid: ${validation.validRows.length}`);
  console.log(`Users created: ${runResult.createdUsers}`);
  console.log(`Users updated: ${runResult.updatedUsers}`);
  console.log(`Rows failed: ${totalFailed}`);

  if (runResult.warnings.length > 0) {
    console.log('Security warnings:');
    for (const warning of runResult.warnings) {
      console.log(`  - ${warning}`);
    }
  }

  if (allOutcomes.length > 0) {
    console.log('Row results:');
    for (const outcome of allOutcomes) {
      console.log(formatOutcome(outcome));
    }
  }

  if (totalFailed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown provisioning failure.';
  console.error(`Provisioning failed: ${message}`);
  process.exit(1);
});

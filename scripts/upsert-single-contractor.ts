#!/usr/bin/env node

import { createHash, randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database';

interface CliOptions {
  firstName: string;
  lastName: string;
  email: string;
  contractorId: string;
  role: string;
}

interface AuthUser {
  id: string;
  email: string | null;
}

function parseCliOptions(args: string[]): CliOptions {
  const get = (flag: string): string | undefined => {
    const index = args.indexOf(flag);
    if (index === -1) {
      return undefined;
    }
    return args[index + 1];
  };

  const firstName = get('--first-name');
  const lastName = get('--last-name');
  const email = get('--email');
  const contractorId = get('--contractor-id');
  const role = get('--role');

  if (!firstName || !lastName || !email || !contractorId || !role) {
    throw new Error(
      'Missing required args. Use: --first-name <value> --last-name <value> --email <value> --contractor-id <value> --role <value>',
    );
  }

  const normalizedContractorId = contractorId.trim().toUpperCase();
  if (!/^[A-Z]{2}\d+$/.test(normalizedContractorId)) {
    throw new Error('Invalid contractor ID format. Expected two letters followed by one or more digits (example: DM01).');
  }

  return {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim().toLowerCase(),
    contractorId: normalizedContractorId,
    role: role.trim().toUpperCase(),
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
}

function contractorCodeToUuid(contractorId: string): string {
  const hash = createHash('md5').update(`contractor:${contractorId}`).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

function buildTempPassword(): string {
  const fragment = randomBytes(8).toString('hex');
  return `Grid!A${fragment}9a`;
}

async function listAllAuthUsers(client: ReturnType<typeof createClient<Database>>): Promise<AuthUser[]> {
  const users: AuthUser[] = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw new Error(`Unable to list auth users: ${error.message}`);
    }

    const batch = (data?.users ?? []) as AuthUser[];
    users.push(...batch);

    if (batch.length < perPage) {
      break;
    }

    page += 1;
  }

  return users;
}

async function findAuthUserByEmail(
  client: ReturnType<typeof createClient<Database>>,
  email: string,
): Promise<AuthUser | null> {
  const users = await listAllAuthUsers(client);
  return users.find((user) => user.email?.toLowerCase() === email) ?? null;
}

async function run(): Promise<void> {
  const options = parseCliOptions(process.argv.slice(2));
  const contractorId = options.contractorId;
  const contractorUuid = contractorCodeToUuid(contractorId);
  const username = options.email.split('@')[0];
  const requestedRole = options.role;

  const client = createClient<Database>(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  );

  let authUser = await findAuthUserByEmail(client, options.email);
  let generatedTempPassword: string | null = null;

  if (!authUser) {
    generatedTempPassword = buildTempPassword();
    const { data, error } = await client.auth.admin.createUser({
      email: options.email,
      password: generatedTempPassword,
      email_confirm: true,
      user_metadata: {
        username,
        first_name: options.firstName,
        last_name: options.lastName,
        contractor_code: contractorId,
      },
    });

    if (error || !data.user) {
      throw new Error(`Unable to create auth user: ${error?.message ?? 'Unknown error'}`);
    }

    authUser = {
      id: data.user.id,
      email: data.user.email ?? options.email,
    };
  } else {
    const { error } = await client.auth.admin.updateUserById(authUser.id, {
      email: options.email,
      email_confirm: true,
      user_metadata: {
        username,
        first_name: options.firstName,
        last_name: options.lastName,
        contractor_code: contractorId,
      },
    });

    if (error) {
      throw new Error(`Unable to update auth metadata: ${error.message}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profilesTable = client.from('profiles') as any;
  const { data: existingProfile, error: existingProfileError } = await profilesTable
    .select('role')
    .eq('id', authUser.id)
    .maybeSingle();

  if (existingProfileError) {
    throw new Error(`Unable to read existing profile role: ${existingProfileError.message}`);
  }

  const { error: probeMustResetError } = await profilesTable
    .select('id, must_reset_password')
    .limit(1);

  const probeErrorMessage = String(probeMustResetError?.message ?? '');
  const missingMustResetColumn = probeErrorMessage.includes("Could not find the 'must_reset_password' column")
    || probeErrorMessage.includes('column profiles.must_reset_password does not exist')
    || probeErrorMessage.includes('column "must_reset_password" does not exist');

  const hasMustResetPasswordColumn = !probeMustResetError
    || !missingMustResetColumn;

  if (probeMustResetError && !missingMustResetColumn) {
    throw new Error(`Unable to inspect profiles schema: ${probeMustResetError.message}`);
  }

  const profilePayload: Record<string, unknown> = {
    id: authUser.id,
    email: options.email,
    first_name: options.firstName,
    last_name: options.lastName,
    is_active: true,
    is_email_verified: true,
    updated_at: new Date().toISOString(),
  };

  if (hasMustResetPasswordColumn) {
    profilePayload.must_reset_password = true;
  }

  const roleCandidates = Array.from(
    new Set([
      requestedRole,
      String(existingProfile?.role ?? '').trim(),
      'CONTRACTOR',
      'SUBCONTRACTOR',
      'TEAM_LEAD',
      'READ_ONLY',
    ].filter(Boolean)),
  );

  let appliedRole: string | null = null;
  let lastProfileError: { message?: string } | null = null;

  for (const candidateRole of roleCandidates) {
    const { error: profileError } = await profilesTable.upsert(
      {
        ...profilePayload,
        role: candidateRole,
      },
      { onConflict: 'id' },
    );

    if (!profileError) {
      appliedRole = candidateRole;
      break;
    }

    lastProfileError = profileError;
    const message = String(profileError.message ?? '');
    if (message.includes('invalid input value for enum user_role')) {
      continue;
    }

    throw new Error(`Unable to upsert profile: ${profileError.message}`);
  }

  if (!appliedRole) {
    throw new Error(`Unable to upsert profile: ${lastProfileError?.message ?? 'No compatible user_role value found.'}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subcontractorsTable = client.from('subcontractors') as any;
  const { data: existingSubcontractor, error: existingError } = await subcontractorsTable
    .select('id')
    .eq('profile_id', authUser.id)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Unable to query subcontractor record: ${existingError.message}`);
  }

  if (existingSubcontractor?.id && existingSubcontractor.id !== contractorUuid) {
    throw new Error(
      `Profile already has contractor UUID ${existingSubcontractor.id}. Refusing to remap to ${contractorUuid}.`,
    );
  }

  const { error: subcontractorError } = await subcontractorsTable.upsert(
    {
      id: contractorUuid,
      profile_id: authUser.id,
      business_name: `${options.firstName} ${options.lastName}`.trim(),
      business_email: options.email,
      onboarding_status: 'APPROVED',
      is_eligible_for_assignment: true,
      eligibility_reason: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'profile_id' },
  );

  if (subcontractorError) {
    throw new Error(`Unable to upsert contractor record: ${subcontractorError.message}`);
  }

  console.log('Contractor upsert complete.');
  console.log(`Email: ${options.email}`);
  console.log(`Username: ${username}`);
  console.log(`Contractor ID: ${contractorId}`);
  console.log(`Contractor UUID: ${contractorUuid}`);
  console.log(`Profile ID (auth user id): ${authUser.id}`);
  console.log(`Requested Role: ${requestedRole}`);
  console.log(`Applied Role: ${appliedRole}`);

  if (generatedTempPassword) {
    console.log(`Temporary Password (rotate on first login): ${generatedTempPassword}`);
  } else {
    console.log('Auth user already existed; password was not changed.');
  }
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`Upsert failed: ${message}`);
  process.exit(1);
});

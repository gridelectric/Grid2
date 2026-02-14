export interface EntergyTicketFormatInput {
  incidentNumber: string;
  sourceAddress: string;
  city: string;
  state: string;
  zipCode: string;
  deviceName: string;
  deviceType: string;
  startTime: string;
  ert: string;
  network: string;
  feeder: string;
  localOffice: string;
  substation: string;
  workOrderId?: string;
  durationMinutes?: number;
  polesDown?: number;
  servicesDown?: number;
  transformers?: number;
  crossArms?: number;
  conductorSpan?: number;
  treeTrim?: number;
  affectedCustomers?: number;
  customerCalls?: number;
  dispatcherComments?: string;
  crewNeedScoutFirst?: string;
  customerComment?: string;
}

function countLine(label: string, value?: number): string {
  return `${label}: ${typeof value === 'number' ? value : 'N/A'}`;
}

export function buildEntergyWorkDescription(input: EntergyTicketFormatInput): string {
  const lines = [
    'Entergy Incident Summary Report',
    `Incident Number: ${input.incidentNumber}`,
    `Address: ${input.sourceAddress}, ${input.city}, ${input.state} ${input.zipCode}`,
    `Device: ${input.deviceName} (${input.deviceType})`,
    `Start Time: ${input.startTime}`,
    `ERT: ${input.ert}`,
    `Network: ${input.network}`,
    `Feeder: ${input.feeder}`,
    `Local Office: ${input.localOffice}`,
    `Substation: ${input.substation}`,
    input.workOrderId ? `Work Order ID: ${input.workOrderId}` : null,
    typeof input.durationMinutes === 'number' ? `Duration (minutes): ${input.durationMinutes}` : null,
    'Damage Assessment',
    countLine('Poles Down', input.polesDown),
    countLine('Services Down', input.servicesDown),
    countLine('Transformers', input.transformers),
    countLine('Cross Arms', input.crossArms),
    countLine('Conductor Span', input.conductorSpan),
    countLine('Tree Trim', input.treeTrim),
    'Customer Impact',
    countLine('Affected Customers', input.affectedCustomers),
    countLine('Customer Calls', input.customerCalls),
  ];

  return lines.filter(Boolean).join('\n');
}

export function buildEntergySpecialInstructions(input: EntergyTicketFormatInput): string | null {
  const lines = [
    input.dispatcherComments?.trim() ? `Dispatcher Comments: ${input.dispatcherComments.trim()}` : null,
    input.crewNeedScoutFirst?.trim() ? `Crew Need Scout First: ${input.crewNeedScoutFirst.trim()}` : null,
    input.customerComment?.trim() ? `Customer Comment: ${input.customerComment.trim()}` : null,
  ].filter(Boolean) as string[];

  return lines.length > 0 ? lines.join('\n') : null;
}


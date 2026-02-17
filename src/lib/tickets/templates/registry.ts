import { CENTERPOINT_TEMPLATE } from './centerpoint';
import { DUKE_TEMPLATE } from './duke';
import { ENTERGY_TEMPLATE } from './entergy';
import { FPL_TEMPLATE } from './fpl';
import { ONCOR_TEMPLATE } from './oncor';
import type { TicketTemplateDefinition, UtilityClient } from './types';

export const TICKET_TEMPLATE_REGISTRY: Record<UtilityClient, TicketTemplateDefinition> = {
  ENTERGY: ENTERGY_TEMPLATE,
  DUKE: DUKE_TEMPLATE,
  CENTERPOINT: CENTERPOINT_TEMPLATE,
  ONCOR: ONCOR_TEMPLATE,
  FPL: FPL_TEMPLATE,
};

export function getTicketTemplateByUtilityClient(utilityClient: UtilityClient): TicketTemplateDefinition {
  return TICKET_TEMPLATE_REGISTRY[utilityClient];
}

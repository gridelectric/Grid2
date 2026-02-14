# Entergy Ticket Intake Format (OCR-Derived)

Source PDF:
- `/Users/grid/Downloads/250202_Incident_Tickets_ChrisWiddon_Batch1.pdf`

Extraction artifact:
- `/Users/grid/Desktop/Grid2/output/pdf/entergy_incident_tickets_batch1_extracted.json`

## Extracted Header Fields

From repeated OCR labels across the batch:
- Incident Number
- Address
- Duration
- Device Name
- Type (for example `ServicePoint`)
- Damage Assessment:
  - Poles Down
  - Services Down
  - Transformers
  - Cross Arms
  - Conductor Span
  - Tree Trim
- Dispatcher Comments
- Crew Need Scout First
- Customer Comment
- Affected Customers
- Customer Calls
- Start Time
- Network
- Feeder
- Work Order ID
- ERT
- Local Office
- Substation

## App Mapping

When `utility_client = Entergy`, ticket entry now uses this format in the UI and stores:
- `ticket_number` = Entergy Incident Number (10-digit validation)
- `work_order_ref` = Work Order ID
- `scheduled_date` = Entergy Start Time
- `due_date` = Entergy ERT
- `work_description` = structured Entergy incident summary block
- `special_instructions` = structured Dispatcher/Crew/Customer comment block

## OCR Notes

- Batch contained 17 incident rows.
- Extraction is OCR-based and may include noise in some free-text comment segments.
- Primary identifiers (incident number, feeder, work order, start/ERT, core labels) were consistently detected.


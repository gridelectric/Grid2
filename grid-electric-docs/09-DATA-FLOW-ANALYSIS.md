# GRID ELECTRIC SERVICES — COMPLETE DATA FLOW & VALIDATION ANALYSIS

## End-to-End Ticket Lifecycle, Data Validation & Implementation Requirements

**Version:** 2.0  
**Date:** February 4, 2026  
**Based On:** Field Forms Analysis (DCO & Outage Field Report)

---

## TABLE OF CONTENTS

1. [Complete Ticket Lifecycle](#1-complete-ticket-lifecycle)
2. [Data Flow by Role](#2-data-flow-by-role)
3. [Field Form Data Extraction](#3-field-form-data-extraction)
4. [Data Validation Matrix](#4-data-validation-matrix)
5. [Identified Gaps & Loopholes](#5-identified-gaps--loopholes)
6. [Implementation Requirements](#6-implementation-requirements)
7. [Updated Database Schema](#7-updated-database-schema)
8. [Security & Permission Matrix](#8-security--permission-matrix)

---

## 1. COMPLETE TICKET LIFECYCLE

### 1.1 Visual State Machine

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              TICKET LIFECYCLE STATE MACHINE                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│   ┌──────────┐                                                                          │
│   │  DRAFT   │ ◄── Admin creates ticket, enters all initial data                       │
│   │  (Admin) │     - Client, location, priority, description                           │
│   └────┬─────┘     - Equipment type (if known)                                         │
│        │           - Scheduled date/time                                               │
│        │                                                                                │
│        ▼           ┌─────────────────────────────────────────────────────────────┐      │
│   ┌──────────┐     │  DATA LOCK: Once assigned, admin fields become READ-ONLY   │      │
│   │ ASSIGNED │◄────┤  for contractors. Only admin can modify through reassignment│      │
│   │  (Admin) │     └─────────────────────────────────────────────────────────────┘      │
│   └────┬─────┘                                                                          │
│        │           Notification sent to contractor                                      │
│        │           Contractor sees ticket in their portal                               │
│        ▼                                                                                │
│   ┌──────────┐     Contractor taps "START ROUTE"                                       │
│   │ IN_ROUTE │     GPS tracking begins (every 30 seconds)                             │
│   │(Contractor)    Location must be within 500m of site to proceed                     │
│   └────┬─────┘                                                                          │
│        │                                                                                │
│        ▼           Contractor arrives on site                                          │
│   ┌──────────┐     Taps "ON SITE" - GPS verification required                          │
│   │ ON_SITE  │     Must be within 500m geofence                                        │
│   │(Contractor)    Photo required at clock-in                                          │
│   └────┬─────┘                                                                          │
│        │                                                                                │
│        ▼           Contractor performs assessment                                       │
│   ┌──────────┐     - Safety checklist                                                   │
│   │IN_PROGRESS│    - Photos with GPS/EXIF                                              │
│   │(Contractor)    - Equipment details                                                 │
│   └────┬─────┘     - Damage classification                                             │
│        │                                                                                │
│        ▼           Work completed                                                      │
│   ┌──────────┐     Contractor taps "COMPLETE"                                          │
│   │ COMPLETE │     Final photos required                                               │
│   │(Contractor)    Clock-out with GPS verification                                     │
│   └────┬─────┘                                                                          │
│        │                                                                                │
│        ▼           Auto-submitted to admin for review                                  │
│   ┌──────────┐     All contractor data is now FROZEN                                   │
│   │ PENDING_ │     (photos, assessment, time entries)                                  │
│   │  REVIEW  │                                                                          │
│   │  (Admin) │                                                                          │
│   └────┬─────┘                                                                          │
│        │                                                                                │
│        ├──────────┬──────────┐                                                          │
│        │          │          │                                                          │
│        ▼          ▼          ▼                                                          │
│   ┌────────┐ ┌──────────┐ ┌────────┐                                                   │
│   │APPROVED│ │NEEDS_    │ │REJECTED│                                                   │
│   │        │ │ REWORK   │ │        │                                                   │
│   └────┬───┘ └────┬─────┘ └────┬───┘                                                   │
│        │          │            │                                                        │
│        ▼          ▼            ▼                                                        │
│   Invoice    Returns to     Ticket     Data retained for                                │
│   generated  contractor     closed     audit trail                                      │
│   with time/ with notes     (archived)                                                  │
│   expenses                                                                              │
│   entries                                                                               │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow Summary Table

| Status | Who | Can Edit | Data Actions | Validation |
|--------|-----|----------|--------------|------------|
| **DRAFT** | Admin | Everything | Create, edit, delete | Required: client, address, priority |
| **ASSIGNED** | Admin | Reassign only | Change assignee, cancel | Cannot edit ticket details |
| **ASSIGNED** | Contractor | Nothing | View only | Read-only until accepted |
| **IN_ROUTE** | Contractor | Status only | Update to ON_SITE | GPS within 500m required |
| **ON_SITE** | Contractor | Clock-out, assessment | Add photos, equipment data | Photo + GPS required |
| **IN_PROGRESS** | Contractor | Everything | Full assessment form | Equipment catalog validation |
| **COMPLETE** | Contractor | Nothing | Submitted, frozen | All required fields checked |
| **PENDING_REVIEW** | Admin | Approval decision | Approve, reject, request rework | Review all contractor data |
| **NEEDS_REWORK** | Contractor | Assessment data | Update based on admin notes | Address all admin comments |
| **APPROVED** | Admin | Nothing | Generate invoice | Auto-create invoice line items |
| **REJECTED** | Admin | Nothing | Archive | Retain for audit |

---

## 2. DATA FLOW BY ROLE

### 2.1 Admin Portal Data Flow

```bash
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ADMIN DATA FLOW                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TICKET CREATION                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 1. Admin clicks "+ New Ticket"                                      │    │
│  │                                                                     │    │
│  │ 2. Form opens with fields:                                          │    │
│  │    ├─ Client/Utility (dropdown: Duke, FPL, TECO, etc.)              │    │
│  │    ├─ Work Order Reference (text, optional)                         │    │
│  │    ├─ Priority (dropdown: A/B/C/X)                                  │    │
│  │    ├─ Address (autocomplete with Mapbox)                            │    │
│  │    ├─ GPS Coordinates (auto-populated from address)                 │    │
│  │    ├─ Geofence Radius (default: 500m, editable)                     │    │
│  │    ├─ Scheduled Date/Time (datetime picker)                         │    │
│  │    ├─ Due Date/Time (datetime picker)                               │    │
│  │    ├─ Equipment Type (dropdown: Transformer, Pole, Switch, etc.)    │    │
│  │    ├─ Work Description (textarea, min 10 chars)                     │    │
│  │    └─ Special Instructions (textarea, optional)                     │    │
│  │                                                                     │    │
│  │ 3. Validation: All required fields must be filled                   │    │
│  │    ├─ Address must geocode successfully                             │    │
│  │    ├─ Due date must be after scheduled date                         │    │
│  │    └─ Description minimum 10 characters                             │    │
│  │                                                                     │    │
│  │ 4. On save: Ticket created with status = DRAFT                      │    │
│  │    ├─ Auto-generated ticket number: GES-YYMMDD-###                  │    │
│  │    └─ Created_by = admin user ID                                    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  TICKET ASSIGNMENT                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 1. Admin selects ticket from list                                   │    │
│  │                                                                     │    │
│  │ 2. Clicks "Assign to Contractor"                                    │    │
│  │                                                                     │    │
│  │ 3. Modal opens showing:                                             │    │
│  │    ├─ List of eligible contractors (approved, available)            │    │
│  │    ├─ Each contractor shows: current workload, location, rating     │    │
│  │    └─ Route optimization option (if multiple tickets)               │    │
│  │                                                                     │    │
│  │ 4. Admin selects contractor                                         │    │
│  │                                                                     │    │
│  │ 5. On assign:                                                       │    │
│  │    ├─ Status changes to ASSIGNED                                    │    │
│  │    ├─ assigned_to = contractor_id                                   │    │
│  │    ├─ assigned_by = admin_id                                        │    │
│  │    ├─ assigned_at = current timestamp                               │    │
│  │    ├─ Push notification sent to contractor                          │    │
│  │    └─ Email notification sent to contractor                         │    │
│  │                                                                     │    │
│  │ 6. DATA LOCK: All admin-entered fields become read-only             │    │
│  │    Only "Reassign" and "Cancel" actions available                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  REVIEW & APPROVAL                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 1. Admin sees ticket in "Pending Review" queue                      │    │
│  │                                                                     │    │
│  │ 2. Opens ticket to review:                                          │    │
│  │    ├─ All contractor-submitted data (read-only)                     │    │
│  │    ├─ Photos with GPS coordinates on map                            │    │
│  │    ├─ Time entries with GPS verification                            │    │
│  │    ├─ Assessment form with all equipment details                    │    │
│  │    └─ Safety checklist responses                                    │    │
│  │                                                                     │    │
│  │ 3. Admin actions:                                                   │    │
│  │    ├─ [APPROVE] → Status = APPROVED → Invoice generated             │    │
│  │    ├─ [NEEDS REWORK] → Status = NEEDS_REWORK + notes                │    │
│  │    └─ [REJECT] → Status = REJECTED (rare, major issues)             │    │
│  │                                                                     │    │
│  │ 4. On approve:                                                      │    │
│  │    ├─ All contractor data FROZEN permanently                        │    │
│  │    ├─ Invoice auto-generated with line items                        │    │
│  │    ├─ Time entries marked as billable                               │    │
│  │    └─ Expenses marked as billable                                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Contractor Portal Data Flow

```dart
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CONTRACTOR DATA FLOW                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  RECEIVING TICKET                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 1. Push notification: "New ticket assigned: GES-260245"             │    │
│  │                                                                     │    │
│  │ 2. Contractor opens app, sees ticket in list                        │    │
│  │                                                                     │    │
│  │ 3. Views ticket details (READ-ONLY):                                │    │
│  │    ├─ Client, priority, address, description                        │    │
│  │    ├─ Scheduled/due dates                                           │    │
│  │    ├─ Map with location marker                                      │    │
│  │    └─ Special instructions                                          │    │
│  │                                                                     │    │
│  │ 4. CANNOT EDIT: All admin-entered fields are locked                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  CLOCK IN / START ROUTE                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 1. Contractor ready to depart, taps "START ROUTE"                   │    │
│  │                                                                     │    │
│  │ 2. GPS location captured (accuracy < 100m required)                 │    │
│  │                                                                     │    │
│  │ 3. Status changes to IN_ROUTE                                       │    │
│  │                                                                     │    │
│  │ 4. Background GPS tracking begins (every 30 seconds)                │    │
│  │                                                                     │    │
│  │ 5. Contractor can open navigation to site                           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ON SITE ARRIVAL                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 1. Contractor arrives at site                                       │    │
│  │                                                                     │    │
│  │ 2. Taps "MARK ON SITE"                                              │    │
│  │                                                                     │    │
│  │ 3. VALIDATION:                                                      │    │
│  │    ├─ GPS location must be within 500m of ticket coordinates        │    │
│  │    ├─ GPS accuracy must be < 100m                                   │    │
│  │    └─ Photo REQUIRED for verification                               │    │
│  │                                                                     │    │
│  │ 4. Camera opens, contractor takes photo                             │    │
│  │    ├─ EXIF GPS extracted from photo                                 │    │
│  │    ├─ Timestamp = server time (NOT device time)                     │    │
│  │    ├─ Stored with: lat, long, accuracy, timestamp, checksum         │    │
│  │    └─ Uploaded to Supabase Storage                                  │    │
│  │                                                                     │    │
│  │ 5. Status changes to ON_SITE                                        │    │
│  │                                                                     │    │
│  │ 6. Time entry created: clock_in_at = current timestamp              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  DAMAGE ASSESSMENT (The Big Form)                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 1. Contractor taps "START ASSESSMENT"                               │    │
│  │                                                                     │    │
│  │ 2. Status changes to IN_PROGRESS                                    │    │
│  │                                                                     │    │
│  │ 3. Multi-step form opens:                                           │    │
│  │                                                                     │    │
│  │    STEP 1: SAFETY OBSERVATIONS                                      │    │
│  │    ├─ Downed conductors? (Yes/No)                                   │    │
│  │    ├─ Damaged insulators? (Yes/No)                                  │    │
│  │    ├─ Vegetation contact? (Yes/No)                                  │    │
│  │    ├─ Structural damage? (Yes/No)                                   │    │
│  │    ├─ Fire hazard? (Yes/No)                                         │    │
│  │    ├─ Public accessible area? (Yes/No)                              │    │
│  │    ├─ Safe distance maintained? (Yes/No - REQUIRED)                 │    │
│  │    └─ PPE worn checklist (Hard hat, vest, gloves - all REQUIRED)    │    │
│  │                                                                     │    │
│  │    STEP 2: POLE DAMAGE (if applicable)                              │    │
│  │    ├─ Pole broken? (Yes/No)                                         │    │
│  │    ├─ Pole class/type (dropdown: 1-10, wood/steel/concrete)         │    │
│  │    ├─ Pole height (dropdown: 30ft, 35ft, 40ft, 45ft, etc.)          │    │
│  │    ├─ Cross arm damaged? (Yes/No)                                   │    │
│  │    ├─ Guy wire damaged? (Yes/No)                                    │    │
│  │    ├─ X-arms quantity                                               │    │
│  │    ├─ Insulator type/quantity                                       │    │
│  │    └─ Damage description (textarea)                                 │    │
│  │                                                                     │    │
│  │    STEP 3: WIRE DAMAGE                                              │    │
│  │    ├─ Vegetation crews required? (Yes/No)                           │    │
│  │    ├─ Service location (Lat/Long/Address/Intersection)              │    │
│  │    ├─ Means of access (Road, Easement, Backyard)                    │    │
│  │    ├─ Primary wire down? (Yes/No)                                   │    │
│  │    ├─ Primary wire size/type (dropdown: see wire sizes below)       │    │
│  │    ├─ # of spans (number)                                           │    │
│  │    ├─ Secondary wire down? (Yes/No)                                 │    │
│  │    ├─ Secondary wire size/type (dropdown)                           │    │
│  │    ├─ Wire accessible? (Yes/No)                                     │    │
│  │    └─ # of phases (1, 2, or 3)                                      │    │
│  │                                                                     │    │
│  │    STEP 4: TRANSFORMER DAMAGE (if applicable)                       │    │
│  │    ├─ Transformer split? (Yes/No)                                   │    │
│  │    ├─ Leakage amount (Light/Moderate/Heavy)                         │    │
│  │    ├─ Transformer KVA (dropdown: 10, 25, 50, 75, 100, etc.)         │    │
│  │    ├─ Pole number (text)                                            │    │
│  │    ├─ Voltage (text)                                                │    │
│  │    ├─ Nearest device # (text)                                       │    │
│  │    ├─ Reported to lead? (Yes/No)                                    │    │
│  │    └─ Time reported (datetime)                                      │    │
│  │                                                                     │    │
│  │    STEP 5: EQUIPMENT INVENTORY                                      │    │
│  │    ├─ Equipment type (dropdown from catalog)                        │    │
│  │    ├─ Equipment # (text/scan)                                       │    │
│  │    ├─ Manufacturer (dropdown)                                       │    │
│  │    ├─ Serial # (text/scan)                                          │    │
│  │    ├─ Condition (Good/Fair/Damaged/Destroyed)                       │    │
│  │    ├─ Requires replacement? (Yes/No)                                │    │
│  │    └─ Photos (min 1 per equipment)                                  │    │
│  │                                                                     │    │
│  │    STEP 6: PHOTOS (Required: minimum 4)                             │    │
│  │    ├─ Overview photo (required)                                     │    │
│  │    ├─ Equipment photo (required)                                    │    │
│  │    ├─ Damage photo (required)                                       │    │
│  │    ├─ Safety/context photo (required)                               │    │
│  │    ├─ Each photo captures:                                          │    │
│  │    │   ├─ GPS coordinates (from EXIF)                               │    │
│  │    │   ├─ Timestamp (server time)                                   │    │
│  │    │   ├─ Photo type tag                                            │    │
│  │    │   └─ Description (optional)                                    │    │
│  │    └─ Photos upload in background (queue if offline)                │    │
│  │                                                                     │    │
│  │    STEP 7: RECOMMENDATIONS                                          │    │
│  │    ├─ Immediate actions taken (textarea)                            │    │
│  │    ├─ Repair vs Replace (Repair/Replace/Engineering Review)         │    │
│  │    ├─ Estimated repair time (hours)                                 │    │
│  │    ├─ Estimated cost (dollar amount)                                │    │
│  │    ├─ Priority recommendation (A/B/C/X)                             │    │
│  │    └─ Additional notes (textarea)                                   │    │
│  │                                                                     │    │
│  │ 4. Digital signature required to submit                             │    │
│  │                                                                     │    │
│  │ 5. On submit: Status = COMPLETE, assessment saved                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  CLOCK OUT                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ 1. Contractor taps "COMPLETE & CLOCK OUT"                           │    │
│  │                                                                     │    │
│  │ 2. VALIDATION:                                                      │    │
│  │    ├─ Assessment form complete (all required fields)                │    │
│  │    ├─ Minimum 4 photos uploaded                                     │    │
│  │    ├─ Digital signature provided                                    │    │
│  │    └─ GPS location captured                                         │    │
│  │                                                                     │    │
│  │ 3. Photo required for clock-out verification                        │    │
│  │                                                                     │    │
│  │ 4. Time entry updated: clock_out_at = current timestamp             │    │
│  │                                                                     │    │
│  │ 5. Status = COMPLETE, ticket submitted for review                   │    │
│  │                                                                     │    │
│  │ 6. All contractor data FROZEN, awaiting admin review                │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. FIELD FORM DATA EXTRACTION

### 3.1 Entergy Distribution Change Order (DCO) — Data Points

```typescript
// Equipment Types (dropdown)
const EQUIPMENT_TYPES = [
  'TRANSFORMER',
  'RECLOSER', 
  'REGULATOR',
  'SWITCH',
  'SWITCH_GEAR',
  'POLE',
  'AUTO_TRANSFORMER',
  'STREETLIGHT',
  'CAPACITOR',
  'BREAKER',
  'SECTIONALIZER',
  'FAULT_INDICATOR',
  'COMMUNICATION_DEVICE',
  'PRIVATE_AREA_LIGHT'
] as const;

// Activity Types (multi-select)
const ACTIVITY_TYPES = [
  'INSTALL',
  'RELOCATE',
  'REMOVE',
  'INSTALL_REMOVE',
  'OTHER',
  'MISC'
] as const;

// Transformer Installation Purpose (multi-select)
const TRANSFORMER_PURPOSES = [
  'CHANGE',
  'METERED_CUSTOMER',
  'UNMETERED_CUSTOMER',
  'LIGHTING',
  'BEHIND_PRIMARY_METER',
  'COMPANY_LINE',
  'COMPANY_SUBSTATION'
] as const;

// Idle Transformer Inspection
const IDLE_TRANSFORMER_STATUS = [
  'REUSE',
  'REBUILD',
  'SCRAP',
  'SPARE',
  'INACTIVE'
] as const;

// Transformer Secondary Connection
const SECONDARY_CONNECTIONS = [
  'WYE',
  'DELTA'
] as const;

// Switch Types
const SWITCH_TYPES = [
  'DISCONNECT',
  'GOAB',
  'FUSE',
  'SWITCH_GEAR'
] as const;

// Change Status
const CHANGE_STATUS = [
  'NEW',
  'REPLACE',
  'CHANGE'
] as const;

// Switch Position
const SWITCH_POSITIONS = [
  'OPEN',
  'CLOSED',
  'BYPASS'
] as const;

// Bypass Switch Types
const BYPASS_SWITCH_TYPES = [
  'DISCONNECT',
  'FUSE',
  'SOLID_BLADE',
  'GOAB',
  'FUSE_AROUND',
  'OTHER'
] as const;

// Pole Owner
const POLE_OWNERS = [
  'COMPANY',
  'ATT',
  'OTHER'
] as const;

// Communication Device Types
const COMM_DEVICE_TYPES = [
  'ACCESS_POINT_AP',
  'RELAY_RY'
] as const;

// Antenna Location
const ANTENNA_LOCATIONS = [
  'WITH_COMM',
  'OTHER_LOCATION'
] as const;

// Reason For Change
const CHANGE_REASONS = [
  'PID',
  'REPLACEMENT',
  'NEW_INSTALLATION'
] as const;

// Customer Tracking Fields
interface CustomerTracking {
  customer_name_or_address: string;
  account_type: 'ACCOUNT_NUMBER' | 'METER_NUMBER' | 'NET_METERING_NUMBER';
  account_value: string;
  old_dloc_or_transformer: string;
  new_dloc_or_transformer: string;
}

// Core DCO Form Data Structure
interface DistributionChangeOrder {
  // Header
  ticket_id: string;
  date: Date;
  work_order_number: string;
  employee_id: string;
  
  // Equipment & Activity
  equipment_types: typeof EQUIPMENT_TYPES[number][];
  activities: typeof ACTIVITY_TYPES[number][];
  
  // Location
  local_office: string;
  store_room: string;
  dloc: string; // Distribution Location Number
  gps_coordinates: {
    latitude: number;
    longitude: number;
  };
  
  // Equipment Details (array for multiple items)
  equipment_items: {
    type: string;
    size: string;
    company_equipment_number: string;
    manufacturer_serial_number: string;
    phase: ('A' | 'B' | 'C')[];
    field_phase: 'F' | 'M' | 'R';
    rec_reg_cap_counter_reading: 'T' | 'C' | 'B';
    install_or_remove: 'INSTALL' | 'REMOVE';
  }[];
  
  // Transformer Specific
  transformer?: {
    purposes: typeof TRANSFORMER_PURPOSES[number][];
    voltage: {
      primary: string;
      secondary: string;
    };
    bank_secondary_connection: typeof SECONDARY_CONNECTIONS[number];
    feeder_number: string;
    feeder_change: boolean;
  };
  
  // Idle Transformer
  idle_transformer_inspection?: typeof IDLE_TRANSFORMER_STATUS[number];
  
  // Street Light
  street_light?: {
    wattage: string;
    type: string;
  };
  private_area_light?: {
    wattage: string;
    type: string;
    map_required: boolean;
  };
  
  // Customer
  customer_name: string;
  field_address_comments: string;
  
  // Switch Details
  switch?: {
    type: typeof SWITCH_TYPES[number];
    installed_number: string;
    removed_number: string;
    quantity: number;
    size: string;
    manufacturer: string;
    catalog_number: string;
    manufacturer_serial: string;
    manufacturer_date: Date;
    change_status: typeof CHANGE_STATUS[number];
    position: typeof SWITCH_POSITIONS[number];
  };
  
  // Bypass Switch
  bypass_switch?: {
    type: typeof BYPASS_SWITCH_TYPES[number];
    size: string;
    type_other: string;
  };
  
  // Pole Change Out
  pole_change_out?: {
    install_size_class: string;
    remove_size_class: string;
    owner: typeof POLE_OWNERS[number];
    owner_other?: string;
  };
  
  // Communication Devices
  communication_devices?: {
    type: typeof COMM_DEVICE_TYPES[number];
    equipment_number: string;
    serial_number: string;
    battery_equipment_number: string;
    battery_serial_number: string;
    antenna_location: typeof ANTENNA_LOCATIONS[number];
  };
  
  // Controls
  controls?: {
    equipment_number: string;
    serial_number: string;
    comm_bridge_equipment_number: string;
    comm_bridge_serial: string;
    battery_1_equipment_number: string;
    battery_1_serial: string;
    battery_2_equipment_number: string;
    battery_2_serial: string;
  };
  
  // Reason
  reason_for_change: typeof CHANGE_REASONS[number];
  
  // Customer Tracking
  customer_tracking?: CustomerTracking[];
  
  // Signatures
  signature: string; // Digital signature data
}
```

### 3.2 Grid Electric Outage Field Report — Data Points

```typescript
// Wire Sizes (Standard AWG and kcmil sizes)
const WIRE_SIZES = [
  // AWG sizes
  '14_AWG', '12_AWG', '10_AWG', '8_AWG', '6_AWG', '4_AWG',
  '3_AWG', '2_AWG', '1_AWG', '1/0_AWG', '2/0_AWG', '3/0_AWG', '4/0_AWG',
  // kcmil sizes
  '250_kcmil', '300_kcmil', '350_kcmil', '400_kcmil', '500_kcmil',
  '600_kcmil', '700_kcmil', '750_kcmil', '800_kcmil', '900_kcmil', '1000_kcmil'
] as const;

// Wire Types
const WIRE_TYPES = [
  'ACSR',      // Aluminum Conductor Steel Reinforced
  'AAC',       // All Aluminum Conductor
  'AAAC',      // All Aluminum Alloy Conductor
  'CU',        // Copper
  'TRIPLEX',   // Triplex service drop
  'QUADRUPLEX',// Quadruplex service drop
  'URD',       // Underground Residential Distribution
  'UD',        // Underground Distribution
  'MV_CABLE',  // Medium Voltage Cable
  'OTHER'
] as const;

// Pole Classes
const POLE_CLASSES = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'
] as const;

// Pole Types
const POLE_TYPES = [
  'WOOD',
  'STEEL',
  'CONCRETE',
  'FIBERGLASS',
  'COMPOSITE'
] as const;

// Pole Heights
const POLE_HEIGHTS = [
  '20ft', '25ft', '30ft', '35ft', '40ft', '45ft', '50ft', '55ft', '60ft', '65ft', '70ft', '75ft', '80ft'
] as const;

// Leakage Amounts
const LEAKAGE_AMOUNTS = [
  'LIGHT',
  'MODERATE',
  'HEAVY'
] as const;

// Means of Access
const ACCESS_METHODS = [
  'ROAD',
  'EASEMENT',
  'BACKYARD',
  'FIELD',
  'OTHER'
] as const;

// Outage Field Report Data Structure
interface OutageFieldReport {
  // Header Information
  assessor_name: string;
  phone_number: string;
  incident_number: string;
  isolation_device_number: string;
  
  // Crew Information
  crew_number: string;
  substation_name: string;
  truck_number: string;
  team_lead_name: string;
  feeder: string;
  
  // Timing
  assessment_date: Date;
  arrival_time: Date;
  completion_time: Date;
  time_reported: Date;
  
  // Initial Assessment
  power_on: boolean;
  wire_down: boolean;
  
  // Wire Down Section
  wire_down_details?: {
    relief_details: string; // Company, Name, Time, Tag #
    vegetation_crews_required: boolean;
    service_location: {
      latitude: number;
      longitude: number;
      address: string;
      intersection: string;
    };
    means_of_access: typeof ACCESS_METHODS[number];
    trimming_spans_quantity: number;
  };
  
  // Pole Damage Section
  pole_damage?: {
    pole_broken: boolean;
    pole_class: typeof POLE_CLASSES[number];
    pole_type: typeof POLE_TYPES[number];
    pole_height: typeof POLE_HEIGHTS[number];
    cross_arm_damaged: boolean;
    cross_arm_quantity: number;
    guy_wire_damaged: boolean;
    guy_wire_quantity: number;
    framing_type: 'SINGLE' | 'DOUBLE' | 'TOP' | 'SIDE' | 'LINE';
    insulator_type: string;
    insulator_quantity: number;
    loose_buried_anchor_guy: boolean;
    damage_description: string;
    additional_pole_details: string;
  };
  
  // Wire Damage Section
  wire_damage?: {
    vegetation_crews_required: boolean;
    service_location: {
      latitude: number;
      longitude: number;
      address: string;
      intersection: string;
    };
    means_of_access: typeof ACCESS_METHODS[number];
    primary_wire_down: boolean;
    primary_wire_size: typeof WIRE_SIZES[number];
    primary_wire_type: typeof WIRE_TYPES[number];
    primary_spans_count: number;
    secondary_wire_down: boolean;
    secondary_wire_size: typeof WIRE_SIZES[number];
    secondary_wire_type: typeof WIRE_TYPES[number];
    secondary_spans_count: number;
    wire_accessible: boolean;
    phases_count: 1 | 2 | 3;
  };
  
  // Transformer Damage Section
  transformer_damage?: {
    transformer_split: boolean;
    leakage_amount: typeof LEAKAGE_AMOUNTS[number];
    kva_rating: number; // 10, 25, 50, 75, 100, etc.
    pole_number: string;
    voltage: string;
    nearest_device_number: string;
    reported_to_lead: boolean;
    time_reported_to_lead: Date;
    damage_description: string;
    additional_details: string;
  };
  
  // Photos (minimum 4 required)
  photos: {
    id: string;
    url: string;
    type: 'OVERVIEW' | 'EQUIPMENT' | 'DAMAGE' | 'SAFETY';
    gps_coordinates: {
      latitude: number;
      longitude: number;
    };
    timestamp: Date;
    description?: string;
  }[];
  
  // Digital Signature
  assessor_signature: string;
  submitted_at: Date;
}
```

---

## 4. DATA VALIDATION MATRIX

### 4.1 Wire Size Reference Table

```typescript
// Standard wire sizes with validation
const WIRE_SIZE_VALIDATION = {
  // AWG sizes - smaller numbers = larger wire
  AWG: {
    sizes: [14, 12, 10, 8, 6, 4, 3, 2, 1, 0, -1, -2, -3], // 1/0 = 0, 2/0 = -1, etc.
    labels: [
      '14 AWG', '12 AWG', '10 AWG', '8 AWG', '6 AWG', '4 AWG',
      '3 AWG', '2 AWG', '1 AWG', '1/0 AWG', '2/0 AWG', '3/0 AWG', '4/0 AWG'
    ],
    typical_use: {
      '14_AWG': 'Residential lighting circuits',
      '12_AWG': 'Residential 20A circuits',
      '10_AWG': 'Residential 30A circuits, water heaters',
      '8_AWG': 'Residential 40A circuits, ranges',
      '6_AWG': 'Residential 60A circuits, subpanels',
      '4_AWG': 'Service entrances, subpanels',
      '2_AWG': 'Service entrances, large loads',
      '1/0_AWG': 'Commercial service entrances',
      '2/0_AWG': 'Commercial/industrial services',
      '3/0_AWG': 'Large commercial services',
      '4/0_AWG': 'Industrial services'
    }
  },
  
  // kcmil sizes - larger numbers = larger wire
  KCMIL: {
    sizes: [250, 300, 350, 400, 500, 600, 700, 750, 800, 900, 1000],
    labels: [
      '250 kcmil', '300 kcmil', '350 kcmil', '400 kcmil', '500 kcmil',
      '600 kcmil', '700 kcmil', '750 kcmil', '800 kcmil', '900 kcmil', '1000 kcmil'
    ],
    typical_use: {
      '250_kcmil': 'Primary distribution, large services',
      '350_kcmil': 'Primary distribution feeders',
      '500_kcmil': 'Primary distribution mains',
      '750_kcmil': 'Subtransmission, large feeders',
      '1000_kcmil': 'Subtransmission, industrial'
    }
  }
};

// Dropdown options for forms
const WIRE_SIZE_OPTIONS = [
  // AWG group
  { value: '14_AWG', label: '14 AWG', group: 'AWG' },
  { value: '12_AWG', label: '12 AWG', group: 'AWG' },
  { value: '10_AWG', label: '10 AWG', group: 'AWG' },
  { value: '8_AWG', label: '8 AWG', group: 'AWG' },
  { value: '6_AWG', label: '6 AWG', group: 'AWG' },
  { value: '4_AWG', label: '4 AWG', group: 'AWG' },
  { value: '3_AWG', label: '3 AWG', group: 'AWG' },
  { value: '2_AWG', label: '2 AWG', group: 'AWG' },
  { value: '1_AWG', label: '1 AWG', group: 'AWG' },
  { value: '1/0_AWG', label: '1/0 AWG', group: 'AWG' },
  { value: '2/0_AWG', label: '2/0 AWG', group: 'AWG' },
  { value: '3/0_AWG', label: '3/0 AWG', group: 'AWG' },
  { value: '4/0_AWG', label: '4/0 AWG', group: 'AWG' },
  // kcmil group
  { value: '250_kcmil', label: '250 kcmil', group: 'kcmil' },
  { value: '300_kcmil', label: '300 kcmil', group: 'kcmil' },
  { value: '350_kcmil', label: '350 kcmil', group: 'kcmil' },
  { value: '400_kcmil', label: '400 kcmil', group: 'kcmil' },
  { value: '500_kcmil', label: '500 kcmil', group: 'kcmil' },
  { value: '600_kcmil', label: '600 kcmil', group: 'kcmil' },
  { value: '700_kcmil', label: '700 kcmil', group: 'kcmil' },
  { value: '750_kcmil', label: '750 kcmil', group: 'kcmil' },
  { value: '800_kcmil', label: '800 kcmil', group: 'kcmil' },
  { value: '900_kcmil', label: '900 kcmil', group: 'kcmil' },
  { value: '1000_kcmil', label: '1000 kcmil', group: 'kcmil' },
];
```

### 4.2 Complete Validation Rules

| Field | Type | Required | Validation | Error Message |
|-------|------|----------|------------|---------------|
| **TICKET CREATION (Admin)** |
| Client | Dropdown | ✅ | Must select from list | "Please select a utility client" |
| Priority | Dropdown | ✅ | A/B/C/X | "Please select a priority level" |
| Address | Text | ✅ | Min 5 chars, must geocode | "Valid address required" |
| GPS Coordinates | Auto | ✅ | Valid lat/long | "Could not geocode address" |
| Scheduled Date | DateTime | ✅ | Future date | "Scheduled date must be in the future" |
| Due Date | DateTime | ✅ | After scheduled | "Due date must be after scheduled date" |
| Equipment Type | Dropdown | ❌ | From catalog | - |
| Description | Textarea | ✅ | Min 10 chars | "Description must be at least 10 characters" |
| **CLOCK IN (Contractor)** |
| GPS Location | Auto | ✅ | Accuracy < 100m | "GPS accuracy too low. Please wait for better signal." |
| Clock-in Photo | Camera | ✅ | Required | "Photo required for verification" |
| **ASSESSMENT (Contractor)** |
| Safe Distance | Checkbox | ✅ | Must be checked | "You must confirm safe distance was maintained" |
| PPE Worn | Checkboxes | ✅ | All 3 required | "All PPE items must be worn" |
| Wire Size | Dropdown | Conditional | From WIRE_SIZES | "Please select a valid wire size" |
| Wire Type | Dropdown | Conditional | From WIRE_TYPES | "Please select a valid wire type" |
| Pole Class | Dropdown | Conditional | 1-10 | "Please select a valid pole class" |
| Photos | Array | ✅ | Min 4 photos | "At least 4 photos required (Overview, Equipment, Damage, Safety)" |
| Photo GPS | Auto | ✅ | Each photo | "Photo GPS data missing" |
| Digital Signature | Signature | ✅ | Required | "Digital signature required" |
| **TIME ENTRY** |
| Clock In | Auto | ✅ | Valid timestamp | - |
| Clock Out | Auto | ✅ | After clock in | "Clock out must be after clock in" |
| Work Type | Dropdown | ✅ | From list | "Please select work type" |
| **EXPENSES** |
| Category | Dropdown | ✅ | From list | "Please select expense category" |
| Amount | Number | ✅ | > 0 | "Amount must be greater than 0" |
| Receipt | Image | Conditional | Required if > $25 | "Receipt required for expenses over $25" |

---

## 5. IDENTIFIED GAPS & LOOPHOLES

### 5.1 Critical Gaps Found

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CRITICAL GAPS & LOopholes                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🔴 GAP 1: Photo Timestamp Integrity                                         │
│  ─────────────────────────────────────────                                   │
│  ISSUE: Device time can be manipulated. Contractor could set phone time      │
│         to fake when photo was taken.                                        │
│                                                                              │
│  SOLUTION:                                                                   │
│  ├─ Store SERVER timestamp when photo is received (not EXIF timestamp)       │
│  ├─ EXIF timestamp = reference only                                          │
│  ├─ Server timestamp = authoritative for billing/legal                       │
│  └─ Display both: "Photo taken: [EXIF] | Uploaded: [Server]"                 │
│                                                                              │
│  IMPLEMENTATION:                                                             │
│  ```sql                                                                      │
│  ALTER TABLE media_assets ADD COLUMN                                         │
│    server_timestamp TIMESTAMPTZ DEFAULT NOW();                               │
│  ```                                                                         │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🔴 GAP 2: GPS Spoofing Detection                                            │
│  ─────────────────────────────────────────                                   │
│  ISSUE: Contractor could use GPS spoofing app to fake location               │
│                                                                              │
│  SOLUTION:                                                                   │
│  ├─ Multi-factor location validation:                                        │
│  │   1. GPS coordinates from device                                          │
│  │   2. GPS coordinates from photo EXIF (should match)                       │
│  │   3. IP geolocation (rough check)                                         │
│  │   4. Time-based travel validation (can't teleport)                        │
│  ├─ Flag if GPS accuracy > 100m                                              │
│  ├─ Flag if photo GPS differs from device GPS by > 50m                       │
│  └─ Admin review required for flagged entries                                │
│                                                                              │
│  IMPLEMENTATION:                                                             │
│  ```typescript                                                               │
│  interface LocationValidation {                                              │
│    deviceGps: GeoLocation;                                                   │
│    photoGps: GeoLocation;                                                    │
│    ipGeolocation?: GeoLocation;                                              │
│    validationResult: 'VALID' | 'SUSPICIOUS' | 'INVALID';                     │
│    flags: string[];                                                          │
│  }                                                                           │
│  ```                                                                         │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🔴 GAP 3: Assessment Data Tampering After Submission                        │
│  ─────────────────────────────────────────────────────                       │
│  ISSUE: Contractor might try to modify assessment after marking complete     │
│                                                                              │
│  SOLUTION:                                                                   │
│  ├─ Create assessment snapshot at submission time                            │
│  ├─ Store SHA-256 hash of assessment data                                    │
│  ├─ Mark all contractor data as IMMUTABLE after COMPLETE status              │
│  ├─ Any changes require admin to reopen ticket                               │
│  └─ Audit log tracks all access attempts                                     │
│                                                                              │
│  IMPLEMENTATION:                                                             │
│  ```sql                                                                      │
│  ALTER TABLE damage_assessments ADD COLUMN                                   │
│    data_hash VARCHAR(64),  -- SHA-256 of JSON data                           │
│    submitted_at TIMESTAMPTZ,                                                 │
│    is_frozen BOOLEAN DEFAULT FALSE;                                          │
│                                                                               │
│  CREATE TRIGGER freeze_assessment_on_complete                                │
│  AFTER UPDATE ON tickets                                                     │
│  FOR EACH ROW WHEN (NEW.status = 'COMPLETE')                                 │
│  EXECUTE FUNCTION freeze_assessment_data();                                  │
│  ```                                                                         │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🟡 GAP 4: Missing Equipment Catalog Validation                              │
│  ─────────────────────────────────────────────────────                       │
│  ISSUE: Contractor can enter any equipment #, no validation against catalog  │
│                                                                              │
│  SOLUTION:                                                                   │
│  ├─ Pre-populate equipment catalog with valid equipment numbers              │
│  ├─ Allow barcode/QR scanning for equipment # entry                          │
│  ├─ Validate equipment # against utility's asset database (if API available) │
│  └─ Flag unknown equipment numbers for admin review                          │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🟡 GAP 5: No Duplicate Photo Detection                                      │
│  ─────────────────────────────────────────────────────                       │
│  ISSUE: Contractor could reuse same photo for multiple tickets               │
│                                                                              │
│  SOLUTION:                                                                   │
│  ├─ Store SHA-256 hash of each photo                                         │
│  ├─ Check for duplicate hashes across all tickets                            │
│  ├─ Flag duplicate photos for admin review                                   │
│  └─ Require unique photos for each ticket                                    │
│                                                                              │
│  IMPLEMENTATION:                                                             │
│  ```sql                                                                      │
│  ALTER TABLE media_assets ADD COLUMN                                         │
│    file_hash VARCHAR(64) UNIQUE;  -- Prevent duplicate uploads               │
│  ```                                                                         │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🟡 GAP 6: Time Entry Gaps                                                   │
│  ─────────────────────────────────────────                                   │
│  ISSUE: Contractor could clock in, go home, come back next day, clock out    │
│                                                                              │
│  SOLUTION:                                                                   │
│  ├─ Maximum time entry duration: 12 hours (configurable)                     │
│  ├─ Auto-clock out after 12 hours with alert                                 │
│  ├─ Require status update every 4 hours (if IN_PROGRESS > 4 hours)           │
│  ├─ Flag entries > 8 hours for admin review                                  │
│  └─ GPS tracking during IN_ROUTE and ON_SITE validates presence              │
│                                                                              │
│  IMPLEMENTATION:                                                             │
│  ```sql                                                                      │
│  ALTER TABLE time_entries ADD COLUMN                                         │
│    max_duration_hours INTEGER DEFAULT 12,                                    │
│    auto_clock_out_at TIMESTAMPTZ;                                            │
│  ```                                                                         │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  🟡 GAP 7: No Offline Expense Receipt Validation                             │
│  ─────────────────────────────────────────────────────                       │
│  ISSUE: Contractor could submit fake expenses offline, admin can't verify    │
│                                                                              │
│  SOLUTION:                                                                   │
│  ├─ OCR extraction of receipt data (date, amount, merchant)                  │
│  ├─ Validate receipt date matches expense date                               │
│  ├─ Flag expenses > $100 for mandatory admin review                          │
│  ├─ Require pre-approval for expenses > $500                                 │
│  └─ Random audit selection (5% of expenses)                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. IMPLEMENTATION REQUIREMENTS

### 6.1 Dependencies to Install

```bash
# Core dependencies (already in project)
npm install @supabase/supabase-js
npm install zustand
npm install @tanstack/react-query
npm install dexie dexie-react-hooks
npm install mapbox-gl
npm install date-fns
npm install zod

# NEW dependencies for enhanced features

# Image processing (for EXIF extraction, compression)
npm install exifreader
npm install browser-image-compression

# OCR for receipt scanning
npm install tesseract.js

# Signature capture
npm install react-signature-canvas

# Barcode/QR scanning for equipment
npm install html5-qrcode

# Form validation (enhanced)
npm install @hookform/resolvers
npm install react-hook-form

# Date/time handling
npm install date-fns-tz  # Timezone support

# Utilities
npm install uuid
npm install crypto-js  # For SHA-256 hashing

# PWA
npm install workbox-window
npm install workbox-routing
npm install workbox-strategies
```

### 6.2 Key Functions to Implement

```typescript
// lib/validation/photoValidation.ts

import ExifReader from 'exifreader';
import { createHash } from 'crypto';

interface PhotoValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  extractedData: {
    gpsLatitude?: number;
    gpsLongitude?: number;
    timestamp?: Date;
    make?: string;
    model?: string;
  };
  fileHash: string;
}

/**
 * Validates uploaded photo meets all requirements
 */
export async function validatePhoto(
  file: File,
  options: {
    requireGps?: boolean;
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): Promise<PhotoValidationResult> {
  const {
    requireGps = true,
    maxSizeMB = 10,
    allowedTypes = ['image/jpeg', 'image/png'],
  } = options;
  
  const errors: string[] = [];
  const warnings: string[] = [];
  const extractedData: PhotoValidationResult['extractedData'] = {};
  
  // 1. File type validation
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
  }
  
  // 2. File size validation
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    errors.push(`File too large (${sizeMB.toFixed(2)}MB). Max: ${maxSizeMB}MB`);
  }
  
  // 3. Calculate file hash (for duplicate detection)
  const arrayBuffer = await file.arrayBuffer();
  const fileHash = createHash('sha256')
    .update(Buffer.from(arrayBuffer))
    .digest('hex');
  
  // 4. Extract EXIF data
  try {
    const tags = await ExifReader.load(arrayBuffer);
    
    // Extract GPS
    if (tags.GPSLatitude && tags.GPSLongitude) {
      extractedData.gpsLatitude = convertDMSToDD(
        tags.GPSLatitude.description,
        tags.GPSLatitudeRef?.value[0]
      );
      extractedData.gpsLongitude = convertDMSToDD(
        tags.GPSLongitude.description,
        tags.GPSLongitudeRef?.value[0]
      );
    } else if (requireGps) {
      errors.push('GPS coordinates missing from photo. Ensure location services are enabled.');
    }
    
    // Extract timestamp
    if (tags.DateTimeOriginal) {
      extractedData.timestamp = new Date(tags.DateTimeOriginal.description);
    }
    
    // Extract device info (for fraud detection)
    if (tags.Make) extractedData.make = tags.Make.description;
    if (tags.Model) extractedData.model = tags.Model.description;
    
  } catch (error) {
    warnings.push('Could not extract EXIF data');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    extractedData,
    fileHash,
  };
}

/**
 * Converts DMS (Degrees, Minutes, Seconds) to Decimal Degrees
 */
function convertDMSToDD(dms: string, ref: string): number {
  const parts = dms.split(',').map(p => parseFloat(p));
  let dd = parts[0] + parts[1] / 60 + parts[2] / 3600;
  if (ref === 'S' || ref === 'W') dd = dd * -1;
  return dd;
}

/**
 * Validates GPS location is within geofence
 */
export function validateGeofence(
  location: { latitude: number; longitude: number },
  center: { latitude: number; longitude: number },
  radiusMeters: number
): { isValid: boolean; distance: number } {
  const distance = calculateDistance(location, center);
  return {
    isValid: distance <= radiusMeters,
    distance,
  };
}

/**
 * Calculates distance between two GPS coordinates in meters
 */
function calculateDistance(
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = point1.latitude * Math.PI / 180;
  const φ2 = point2.latitude * Math.PI / 180;
  const Δφ = (point2.latitude - point1.latitude) * Math.PI / 180;
  const Δλ = (point2.longitude - point1.longitude) * Math.PI / 180;
  
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}
```

```typescript
// lib/validation/timeEntryValidation.ts

import { differenceInHours } from 'date-fns';

interface TimeEntryValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  autoClockOutAt?: Date;
}

const MAX_TIME_ENTRY_HOURS = 12;
const WARNING_THRESHOLD_HOURS = 8;

/**
 * Validates time entry for fraud detection
 */
export function validateTimeEntry(
  clockInAt: Date,
  clockOutAt?: Date,
  gpsLocations?: { clockIn: GeoLocation; clockOut?: GeoLocation }
): TimeEntryValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  let autoClockOutAt: Date | undefined;
  
  const now = new Date();
  const duration = clockOutAt 
    ? differenceInHours(clockOutAt, clockInAt)
    : differenceInHours(now, clockInAt);
  
  // 1. Duration validation
  if (duration > MAX_TIME_ENTRY_HOURS) {
    if (!clockOutAt) {
      // Auto-clock out
      autoClockOutAt = new Date(clockInAt.getTime() + MAX_TIME_ENTRY_HOURS * 60 * 60 * 1000);
      warnings.push(`Time entry exceeded ${MAX_TIME_ENTRY_HOURS} hours. Auto clock-out scheduled.`);
    } else {
      errors.push(`Time entry duration (${duration.toFixed(1)}h) exceeds maximum (${MAX_TIME_ENTRY_HOURS}h)`);
    }
  } else if (duration > WARNING_THRESHOLD_HOURS) {
    warnings.push(`Long time entry (${duration.toFixed(1)}h). May require admin review.`);
  }
  
  // 2. GPS validation
  if (gpsLocations?.clockOut && gpsLocations.clockIn) {
    const distance = calculateDistance(
      { latitude: gpsLocations.clockIn.latitude, longitude: gpsLocations.clockIn.longitude },
      { latitude: gpsLocations.clockOut.latitude, longitude: gpsLocations.clockOut.longitude }
    );
    
    // Can't travel more than 100 miles in a work day (prevents teleporting)
    const MAX_DAILY_TRAVEL_MILES = 100;
    if (distance > MAX_DAILY_TRAVEL_MILES * 1609.34) {
      errors.push('GPS locations too far apart. Possible GPS spoofing detected.');
    }
  }
  
  // 3. Time of day validation
  const clockInHour = clockInAt.getHours();
  if (clockInHour < 4 || clockInHour > 22) {
    warnings.push('Unusual clock-in time. May require admin review.');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    autoClockOutAt,
  };
}
```

```typescript
// lib/sync/assessmentSync.ts

import { createHash } from 'crypto';
import { supabase } from '@/lib/supabase/client';
import { db } from '@/lib/db/dexie';

/**
 * Submits assessment with integrity protection
 */
export async function submitAssessment(
  assessmentData: DamageAssessment,
  options: {
    ticketId: string;
    subcontractorId: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const { ticketId, subcontractorId } = options;
  
  try {
    // 1. Validate all required fields
    const validation = validateAssessmentData(assessmentData);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') };
    }
    
    // 2. Calculate data hash (for tamper detection)
    const dataHash = createHash('sha256')
      .update(JSON.stringify(assessmentData))
      .digest('hex');
    
    // 3. Prepare submission
    const submission = {
      ticket_id: ticketId,
      subcontractor_id: subcontractorId,
      ...assessmentData,
      data_hash: dataHash,
      submitted_at: new Date().toISOString(),
      is_frozen: true,
    };
    
    // 4. Save to Supabase
    const { data, error } = await supabase
      .from('damage_assessments')
      .insert(submission)
      .select()
      .single();
    
    if (error) throw error;
    
    // 5. Update ticket status to COMPLETE
    await supabase
      .from('tickets')
      .update({ status: 'COMPLETE' })
      .eq('id', ticketId);
    
    // 6. Clear from local sync queue
    await db.syncQueue
      .where({ table: 'damage_assessments', entity_id: ticketId })
      .delete();
    
    return { success: true };
    
  } catch (error) {
    // Queue for retry
    await db.syncQueue.add({
      id: crypto.randomUUID(),
      operation: 'CREATE',
      table: 'damage_assessments',
      entity_id: ticketId,
      payload: assessmentData,
      status: 'PENDING',
      retry_count: 0,
      created_at: new Date(),
    });
    
    return { 
      success: false, 
      error: (error as Error).message 
    };
  }
}

/**
 * Validates assessment data completeness
 */
function validateAssessmentData(data: DamageAssessment): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Required: Safety observations
  if (!data.safety_observations?.safe_distance_maintained) {
    errors.push('Safe distance confirmation required');
  }
  
  // Required: Photos (minimum 4)
  if (!data.photos || data.photos.length < 4) {
    errors.push('Minimum 4 photos required');
  }
  
  // Required: Signature
  if (!data.digital_signature) {
    errors.push('Digital signature required');
  }
  
  // Validate wire sizes if wire damage reported
  if (data.wire_damage?.primary_wire_down && !data.wire_damage.primary_wire_size) {
    errors.push('Primary wire size required when wire down reported');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}
```

---

## 7. UPDATED DATABASE SCHEMA

### 7.1 New Tables for Field Forms

```sql
-- Equipment Catalog (pre-populated with utility's assets)
CREATE TABLE equipment_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utility_client VARCHAR(100) NOT NULL,
  equipment_number VARCHAR(100) NOT NULL,
  equipment_type VARCHAR(100) NOT NULL,
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100),
  voltage_rating VARCHAR(50),
  kva_rating INTEGER,
  phase VARCHAR(10),
  installation_date DATE,
  location_dloc VARCHAR(100),
  gps_latitude DECIMAL(10, 8),
  gps_longitude DECIMAL(11, 8),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(utility_client, equipment_number)
);

-- Wire Size Reference Table
CREATE TABLE wire_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  size_code VARCHAR(20) NOT NULL UNIQUE, -- e.g., '4_AWG', '250_kcmil'
  size_label VARCHAR(20) NOT NULL, -- e.g., '4 AWG', '250 kcmil'
  size_type VARCHAR(10) NOT NULL CHECK (size_type IN ('AWG', 'KCMIL')),
  diameter_inches DECIMAL(8, 6),
  ampacity INTEGER,
  typical_use TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Populate wire sizes
INSERT INTO wire_sizes (size_code, size_label, size_type, typical_use) VALUES
-- AWG sizes
('14_AWG', '14 AWG', 'AWG', 'Residential lighting circuits'),
('12_AWG', '12 AWG', 'AWG', 'Residential 20A circuits'),
('10_AWG', '10 AWG', 'AWG', 'Residential 30A circuits'),
('8_AWG', '8 AWG', 'AWG', 'Residential 40A circuits'),
('6_AWG', '6 AWG', 'AWG', 'Residential 60A circuits'),
('4_AWG', '4 AWG', 'AWG', 'Service entrances, subpanels'),
('3_AWG', '3 AWG', 'AWG', 'Service entrances'),
('2_AWG', '2 AWG', 'AWG', 'Service entrances, large loads'),
('1_AWG', '1 AWG', 'AWG', 'Commercial service entrances'),
('1/0_AWG', '1/0 AWG', 'AWG', 'Commercial service entrances'),
('2/0_AWG', '2/0 AWG', 'AWG', 'Commercial/industrial services'),
('3/0_AWG', '3/0 AWG', 'AWG', 'Large commercial services'),
('4/0_AWG', '4/0 AWG', 'AWG', 'Industrial services'),
-- kcmil sizes
('250_kcmil', '250 kcmil', 'KCMIL', 'Primary distribution, large services'),
('300_kcmil', '300 kcmil', 'KCMIL', 'Primary distribution'),
('350_kcmil', '350 kcmil', 'KCMIL', 'Primary distribution feeders'),
('400_kcmil', '400 kcmil', 'KCMIL', 'Primary distribution'),
('500_kcmil', '500 kcmil', 'KCMIL', 'Primary distribution mains'),
('600_kcmil', '600 kcmil', 'KCMIL', 'Subtransmission'),
('700_kcmil', '700 kcmil', 'KCMIL', 'Subtransmission'),
('750_kcmil', '750 kcmil', 'KCMIL', 'Subtransmission, large feeders'),
('800_kcmil', '800 kcmil', 'KCMIL', 'Subtransmission'),
('900_kcmil', '900 kcmil', 'KCMIL', 'Subtransmission'),
('1000_kcmil', '1000 kcmil', 'KCMIL', 'Subtransmission, industrial');

-- Enhanced Damage Assessment Table
ALTER TABLE damage_assessments ADD COLUMN IF NOT EXISTS
  data_hash VARCHAR(64),
  submitted_at TIMESTAMPTZ,
  is_frozen BOOLEAN DEFAULT FALSE,
  -- Wire Damage Section
  wire_damage JSONB,
  -- Pole Damage Section
  pole_damage JSONB,
  -- Transformer Damage Section
  transformer_damage JSONB,
  -- DCO Fields
  dloc VARCHAR(100),
  activities VARCHAR(50)[],
  equipment_items JSONB,
  change_reason VARCHAR(50);

-- Enhanced Media Assets Table
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS
  server_timestamp TIMESTAMPTZ DEFAULT NOW(),
  file_hash VARCHAR(64) UNIQUE,
  photo_type VARCHAR(20) CHECK (photo_type IN ('OVERVIEW', 'EQUIPMENT', 'DAMAGE', 'SAFETY', 'CLOCK_IN', 'CLOCK_OUT')),
  validation_status VARCHAR(20) DEFAULT 'PENDING' CHECK (validation_status IN ('PENDING', 'VALID', 'SUSPICIOUS', 'INVALID')),
  validation_flags TEXT[];

-- Enhanced Time Entries Table
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS
  max_duration_hours INTEGER DEFAULT 12,
  auto_clock_out_at TIMESTAMPTZ,
  validation_flags TEXT[],
  device_info JSONB;

-- Photo Duplicate Detection Table
CREATE TABLE photo_duplicates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_hash VARCHAR(64) NOT NULL,
  original_media_id UUID REFERENCES media_assets(id),
  duplicate_media_id UUID REFERENCES media_assets(id),
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  is_legitimate BOOLEAN
);

-- GPS Validation Log
CREATE TABLE gps_validation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  device_gps_latitude DECIMAL(10, 8),
  device_gps_longitude DECIMAL(11, 8),
  photo_gps_latitude DECIMAL(10, 8),
  photo_gps_longitude DECIMAL(11, 8),
  distance_meters DECIMAL(10, 2),
  accuracy_meters DECIMAL(8, 2),
  validation_result VARCHAR(20),
  flags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. SECURITY & PERMISSION MATRIX

### 8.1 Field-Level Permissions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FIELD-LEVEL PERMISSION MATRIX                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TICKET TABLE                                                                │
│  ┌────────────────────────┬─────────┬─────────────┬─────────────────────┐   │
│  │ Field                  │ Admin   │ Contractor  │ Notes               │   │
│  ├────────────────────────┼─────────┼─────────────┼─────────────────────┤   │
│  │ ticket_number          │ R/W     │ R           │ Auto-generated      │   │
│  │ status                 │ R/W*    │ R/W**       │ *Can force change   │   │
│  │ priority               │ R/W     │ R           │ Admin sets only     │   │
│  │ address                │ R/W     │ R           │ Locked after assign │   │
│  │ gps_coordinates        │ R/W     │ R           │ From geocode        │   │
│  │ geofence_radius        │ R/W     │ R           │ Configurable        │   │
│  │ assigned_to            │ R/W     │ R           │ Admin controls      │   │
│  │ utility_client         │ R/W     │ R           │ Locked after assign │   │
│  │ work_order_ref         │ R/W     │ R           │ Locked after assign │   │
│  │ work_description       │ R/W     │ R           │ Locked after assign │   │
│  │ scheduled_date         │ R/W     │ R           │ Locked after assign │   │
│  │ due_date               │ R/W     │ R           │ Locked after assign │   │
│  │ created_by             │ R       │ R           │ System set          │   │
│  │ created_at             │ R       │ R           │ System set          │   │
│  └────────────────────────┴─────────┴─────────────┴─────────────────────┘   │
│                                                                              │
│  * Contractor can only change: DRAFT → IN_ROUTE → ON_SITE → IN_PROGRESS →   │
│    COMPLETE. Any other change requires admin.                                │
│                                                                              │
│  DAMAGE_ASSESSMENT TABLE                                                     │
│  ┌────────────────────────┬─────────┬─────────────┬─────────────────────┐   │
│  │ Field                  │ Admin   │ Contractor  │ Notes               │   │
│  ├────────────────────────┼─────────┼─────────────┼─────────────────────┤   │
│  │ safety_observations    │ R       │ R/W         │ Contractor fills    │   │
│  │ wire_damage            │ R       │ R/W         │ Contractor fills    │   │
│  │ pole_damage            │ R       │ R/W         │ Contractor fills    │   │
│  │ transformer_damage     │ R       │ R/W         │ Contractor fills    │   │
│  │ equipment_assessments  │ R       │ R/W         │ Contractor fills    │   │
│  │ photos                 │ R       │ R/W         │ Contractor uploads  │   │
│  │ recommendations        │ R       │ R/W         │ Contractor fills    │   │
│  │ digital_signature      │ R       │ R/W         │ Required to submit  │   │
│  │ data_hash              │ R       │ R           │ System generated    │   │
│  │ submitted_at           │ R       │ R           │ System set          │   │
│  │ is_frozen              │ R       │ R           │ Auto-set on submit  │   │
│  │ review_notes           │ R/W     │ R           │ Admin only          │   │
│  │ reviewed_by            │ R       │ R           │ System set          │   │
│  └────────────────────────┴─────────┴─────────────┴─────────────────────┘   │
│                                                                              │
│  ** Once is_frozen = TRUE, contractor has NO WRITE ACCESS to any field **   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

**END OF DATA FLOW & VALIDATION ANALYSIS**

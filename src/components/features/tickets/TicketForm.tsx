
'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    buildEntergySpecialInstructions,
    buildEntergyWorkDescription,
    type EntergyTicketFormatInput,
} from "@/lib/constants/entergyTicketFormat"
import { isEntergyUtilityClient, UTILITY_CLIENTS } from "@/lib/constants/utilityClients"
import { stormEventService, type StormEventSummary } from "@/lib/services/stormEventService"
import { ticketService } from "@/lib/services/ticketService"
import { getErrorMessage } from "@/lib/utils/errorHandling"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const optionalNonNegativeInteger = z.preprocess((value) => {
    if (value === "" || value === undefined || value === null) {
        return undefined
    }

    const parsed = Number(value)
    if (Number.isNaN(parsed)) {
        return value
    }

    return parsed
}, z.number().int().min(0).optional())

const ticketFormSchema = z.object({
    storm_event_id: z.string().min(1, "Storm event is required"),
    ticket_number: z.string().min(1, "Ticket number is required"),
    utility_client: z.string().min(1, "Utility Client is required"),
    work_order_ref: z.string().optional(),
    work_description: z.string().optional(),
    special_instructions: z.string().optional(),
    priority: z.enum(["A", "B", "C", "X"]),
    status: z.enum(["DRAFT", "ASSIGNED", "REJECTED", "IN_ROUTE", "ON_SITE", "IN_PROGRESS", "COMPLETE", "PENDING_REVIEW", "APPROVED", "NEEDS_REWORK", "CLOSED", "ARCHIVED", "EXPIRED"]),
    scheduled_date: z.string().optional(),
    due_date: z.string().optional(),
    equipment_type: z.string().optional(),
    address: z.string().min(5, "Valid address required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(2, "State is required"),
    zip_code: z.string().min(5, "Zip Code is required"),
    geofence_radius_meters: z.coerce.number().min(0).default(500),
    entergy_device_name: z.string().optional(),
    entergy_device_type: z.string().optional(),
    entergy_duration_minutes: optionalNonNegativeInteger,
    entergy_start_time: z.string().optional(),
    entergy_ert: z.string().optional(),
    entergy_network: z.string().optional(),
    entergy_feeder: z.string().optional(),
    entergy_local_office: z.string().optional(),
    entergy_substation: z.string().optional(),
    entergy_poles_down: optionalNonNegativeInteger,
    entergy_services_down: optionalNonNegativeInteger,
    entergy_transformers: optionalNonNegativeInteger,
    entergy_cross_arms: optionalNonNegativeInteger,
    entergy_conductor_span: optionalNonNegativeInteger,
    entergy_tree_trim: optionalNonNegativeInteger,
    entergy_affected_customers: optionalNonNegativeInteger,
    entergy_customer_calls: optionalNonNegativeInteger,
    entergy_dispatcher_comments: z.string().optional(),
    entergy_crew_need_scout_first: z.string().optional(),
    entergy_customer_comment: z.string().optional(),
}).superRefine((data, ctx) => {
    if (isEntergyUtilityClient(data.utility_client)) {
        if (!/^\d{10}$/.test(data.ticket_number.trim())) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Entergy incident number must be 10 digits",
                path: ["ticket_number"],
            })
        }

        type EntergyRequiredFieldPath =
            | "entergy_device_name"
            | "entergy_device_type"
            | "entergy_start_time"
            | "entergy_ert"
            | "entergy_network"
            | "entergy_feeder"
            | "entergy_local_office"
            | "entergy_substation"

        const requiredEntergyFields: Array<{ path: EntergyRequiredFieldPath; label: string }> = [
            { path: "entergy_device_name", label: "Device Name is required for Entergy tickets" },
            { path: "entergy_device_type", label: "Device Type is required for Entergy tickets" },
            { path: "entergy_start_time", label: "Start Time is required for Entergy tickets" },
            { path: "entergy_ert", label: "ERT is required for Entergy tickets" },
            { path: "entergy_network", label: "Network is required for Entergy tickets" },
            { path: "entergy_feeder", label: "Feeder is required for Entergy tickets" },
            { path: "entergy_local_office", label: "Local Office is required for Entergy tickets" },
            { path: "entergy_substation", label: "Substation is required for Entergy tickets" },
        ]

        for (const field of requiredEntergyFields) {
            const value = data[field.path]
            if (typeof value !== "string" || value.trim().length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: field.label,
                    path: [field.path],
                })
            }
        }

        if (data.entergy_start_time && data.entergy_ert) {
            const start = new Date(data.entergy_start_time)
            const end = new Date(data.entergy_ert)
            if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end <= start) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "ERT must be later than Start Time",
                    path: ["entergy_ert"],
                })
            }
        }

        return
    }

    if (!data.work_description || data.work_description.trim().length < 10) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Description must be at least 10 characters",
            path: ["work_description"],
        })
    }

    if (!data.scheduled_date) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Scheduled date is required",
            path: ["scheduled_date"],
        })
    }

    if (!data.due_date) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Due date is required",
            path: ["due_date"],
        })
    }

    if (data.scheduled_date && data.due_date) {
        const scheduled = new Date(data.scheduled_date)
        const due = new Date(data.due_date)
        if (!Number.isNaN(scheduled.getTime()) && !Number.isNaN(due.getTime()) && due <= scheduled) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Due date must be after scheduled date",
                path: ["due_date"],
            })
        }
    }
})

type TicketFormValues = z.infer<typeof ticketFormSchema>

interface TicketFormProps {
    defaultUtilityClient?: string
    lockUtilityClient?: boolean
    defaultStormEventId?: string
    lockStormEvent?: boolean
}

function toTrimmedOrUndefined(value?: string): string | undefined {
    const trimmed = value?.trim()
    return trimmed ? trimmed : undefined
}

export function TicketForm({
    defaultUtilityClient,
    lockUtilityClient = false,
    defaultStormEventId,
    lockStormEvent = false,
}: TicketFormProps) {
    const router = useRouter()
    const [stormEvents, setStormEvents] = useState<StormEventSummary[]>([])
    const [isStormEventsLoading, setIsStormEventsLoading] = useState(true)
    const form = useForm<TicketFormValues>({
        resolver: zodResolver(ticketFormSchema),
        defaultValues: {
            storm_event_id: "",
            ticket_number: "",
            utility_client: "",
            work_order_ref: "",
            work_description: "",
            special_instructions: "",
            priority: "C",
            status: "DRAFT",
            scheduled_date: "",
            due_date: "",
            equipment_type: "",
            address: "",
            city: "",
            state: "",
            zip_code: "",
            geofence_radius_meters: 500,
            entergy_device_name: "",
            entergy_device_type: "",
            entergy_duration_minutes: undefined,
            entergy_start_time: "",
            entergy_ert: "",
            entergy_network: "",
            entergy_feeder: "",
            entergy_local_office: "",
            entergy_substation: "",
            entergy_poles_down: undefined,
            entergy_services_down: undefined,
            entergy_transformers: undefined,
            entergy_cross_arms: undefined,
            entergy_conductor_span: undefined,
            entergy_tree_trim: undefined,
            entergy_affected_customers: undefined,
            entergy_customer_calls: undefined,
            entergy_dispatcher_comments: "",
            entergy_crew_need_scout_first: "",
            entergy_customer_comment: "",
        },
    })

    useEffect(() => {
        if (!defaultUtilityClient) {
            return
        }

        form.setValue("utility_client", defaultUtilityClient, { shouldValidate: true })
    }, [defaultUtilityClient, form])

    useEffect(() => {
        if (!defaultStormEventId) {
            return
        }

        form.setValue("storm_event_id", defaultStormEventId, { shouldValidate: true })
    }, [defaultStormEventId, form])

    useEffect(() => {
        let active = true

        const loadStormEvents = async () => {
            setIsStormEventsLoading(true)
            try {
                const items = await stormEventService.listStormEvents()
                if (active) {
                    setStormEvents(items.filter((item) => item.status !== "ARCHIVED"))
                }
            } catch (error) {
                if (active) {
                    setStormEvents([])
                }
                toast.error(getErrorMessage(error, "Failed to load storm events"))
            } finally {
                if (active) {
                    setIsStormEventsLoading(false)
                }
            }
        }

        void loadStormEvents()

        return () => {
            active = false
        }
    }, [])

    const selectedStormEventId = form.watch("storm_event_id")
    const selectedUtilityClient = form.watch("utility_client")
    const selectedStormEvent = stormEvents.find((item) => item.id === selectedStormEventId)
    const isEntergyFormat = isEntergyUtilityClient(selectedUtilityClient)

    useEffect(() => {
        if (!selectedStormEvent) {
            return
        }

        form.setValue("utility_client", selectedStormEvent.utilityClient, { shouldValidate: true })
    }, [form, selectedStormEvent])

    async function onSubmit(data: TicketFormValues) {
        try {
            const utilityClient = data.utility_client.trim()

            let entergyInput: EntergyTicketFormatInput | null = null
            if (isEntergyUtilityClient(utilityClient)) {
                entergyInput = {
                    incidentNumber: data.ticket_number.trim(),
                    sourceAddress: data.address.trim(),
                    city: data.city.trim(),
                    state: data.state.trim().toUpperCase(),
                    zipCode: data.zip_code.trim(),
                    deviceName: data.entergy_device_name?.trim() ?? "",
                    deviceType: data.entergy_device_type?.trim() ?? "",
                    startTime: data.entergy_start_time?.trim() ?? "",
                    ert: data.entergy_ert?.trim() ?? "",
                    network: data.entergy_network?.trim() ?? "",
                    feeder: data.entergy_feeder?.trim() ?? "",
                    localOffice: data.entergy_local_office?.trim() ?? "",
                    substation: data.entergy_substation?.trim() ?? "",
                    workOrderId: toTrimmedOrUndefined(data.work_order_ref),
                    durationMinutes: data.entergy_duration_minutes,
                    polesDown: data.entergy_poles_down,
                    servicesDown: data.entergy_services_down,
                    transformers: data.entergy_transformers,
                    crossArms: data.entergy_cross_arms,
                    conductorSpan: data.entergy_conductor_span,
                    treeTrim: data.entergy_tree_trim,
                    affectedCustomers: data.entergy_affected_customers,
                    customerCalls: data.entergy_customer_calls,
                    dispatcherComments: toTrimmedOrUndefined(data.entergy_dispatcher_comments),
                    crewNeedScoutFirst: toTrimmedOrUndefined(data.entergy_crew_need_scout_first),
                    customerComment: toTrimmedOrUndefined(data.entergy_customer_comment),
                }
            }

            const payload = {
                storm_event_id: data.storm_event_id,
                ticket_number: data.ticket_number.trim(),
                utility_client: utilityClient,
                work_order_ref: toTrimmedOrUndefined(data.work_order_ref),
                work_description: entergyInput
                    ? buildEntergyWorkDescription(entergyInput)
                    : data.work_description?.trim(),
                special_instructions: entergyInput
                    ? buildEntergySpecialInstructions(entergyInput) ?? undefined
                    : toTrimmedOrUndefined(data.special_instructions),
                priority: data.priority,
                status: data.status,
                scheduled_date: entergyInput ? data.entergy_start_time : data.scheduled_date,
                due_date: entergyInput ? data.entergy_ert : data.due_date,
                equipment_type: entergyInput
                    ? toTrimmedOrUndefined(data.entergy_device_type)
                    : toTrimmedOrUndefined(data.equipment_type),
                address: data.address.trim(),
                city: data.city.trim(),
                state: data.state.trim().toUpperCase(),
                zip_code: data.zip_code.trim(),
                geofence_radius_meters: data.geofence_radius_meters,
            }

            await ticketService.createTicket(payload)
            toast.success("Ticket created successfully")
            router.push("/tickets")
            router.refresh()
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to create ticket"))
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="storm_event_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Storm Event *</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={lockStormEvent || isStormEventsLoading}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isStormEventsLoading ? "Loading storm events..." : "Select Storm Event"} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {stormEvents.map((stormEvent) => (
                                            <SelectItem key={stormEvent.id} value={stormEvent.id}>
                                                {stormEvent.eventCode} - {stormEvent.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {!isStormEventsLoading && stormEvents.length === 0 ? (
                                    <p className="text-xs text-amber-700">
                                        No storm events found. Create a storm event before adding ticket entries.
                                    </p>
                                ) : null}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="ticket_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{isEntergyFormat ? "Incident Number *" : "Ticket Number *"}</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder={isEntergyFormat ? "2030168317" : "GES-260210-001"}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="utility_client"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Utility Client *</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    disabled={lockUtilityClient || Boolean(selectedStormEvent)}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Client" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {UTILITY_CLIENTS.map((utilityClient) => (
                                            <SelectItem key={utilityClient} value={utilityClient}>
                                                {utilityClient}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="work_order_ref"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{isEntergyFormat ? "Work Order ID" : "Work Order Ref (Optional)"}</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ref #" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {isEntergyFormat ? (
                    <div className="space-y-6 rounded-md border border-blue-200 bg-blue-50/50 p-4">
                        <div className="text-sm text-blue-900">
                            Entergy format is enforced for this ticket. Fields are based on the OCR extraction from your
                            Entergy incident report.
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FormField
                                control={form.control}
                                name="entergy_device_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Device Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="9304334" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="entergy_device_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ServicePoint">ServicePoint</SelectItem>
                                                <SelectItem value="Service">Service</SelectItem>
                                                <SelectItem value="Transformer">Transformer</SelectItem>
                                                <SelectItem value="Pole">Pole</SelectItem>
                                                <SelectItem value="Wire">Wire</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="entergy_duration_minutes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duration (minutes)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="13543" {...field} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="entergy_start_time"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Time *</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="entergy_ert"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ERT *</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="entergy_network"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Network *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="West Monroe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="entergy_feeder"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Feeder *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="N5303" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="entergy_local_office"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Local Office *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="WEST MONROE" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="entergy_substation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Substation *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="CADEVILLE" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="entergy_affected_customers"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Affected Customers</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0" {...field} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="entergy_customer_calls"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Calls</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0" {...field} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-blue-900">Damage Assessment</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <FormField
                                    control={form.control}
                                    name="entergy_poles_down"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Poles Down</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="0" {...field} value={field.value ?? ""} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="entergy_services_down"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Services Down</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="0" {...field} value={field.value ?? ""} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="entergy_transformers"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Transformers</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="0" {...field} value={field.value ?? ""} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="entergy_cross_arms"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cross Arms</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="0" {...field} value={field.value ?? ""} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="entergy_conductor_span"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Conductor Span</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="0" {...field} value={field.value ?? ""} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="entergy_tree_trim"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tree Trim</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="0" {...field} value={field.value ?? ""} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                control={form.control}
                                name="entergy_dispatcher_comments"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dispatcher Comments</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Dispatcher notes from Entergy report..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="entergy_crew_need_scout_first"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Crew Need Scout First</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Crew scouting requirement notes..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="entergy_customer_comment"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Customer Comment</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Customer comments from report..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="work_description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Work Description *</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Describe the damage or work required (min 10 chars)..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="special_instructions"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Special Instructions</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Access codes, gate keys, or safety warnings..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Priority *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="A">A - Critical</SelectItem>
                                        <SelectItem value="B">B - Urgent</SelectItem>
                                        <SelectItem value="C">C - Standard</SelectItem>
                                        <SelectItem value="X">X - Hold</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {!isEntergyFormat && (
                        <>
                            <FormField
                                control={form.control}
                                name="equipment_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Initial Equipment Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Transformer">Transformer</SelectItem>
                                                <SelectItem value="Pole">Pole</SelectItem>
                                                <SelectItem value="Conductor/Wire">Conductor/Wire</SelectItem>
                                                <SelectItem value="Switch">Switch</SelectItem>
                                                <SelectItem value="Capacitor">Capacitor</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="scheduled_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Scheduled Date *</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="due_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Date *</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Location Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123 Main St" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="City" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="state"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>State *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="FL" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="zip_code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Zip Code *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="33601" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="geofence_radius_meters"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Geofence Radius (meters)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="500" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit">Create Ticket</Button>
                </div>
            </form>
        </Form>
    )
}

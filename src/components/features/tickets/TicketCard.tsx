import { Ticket } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CalendarDays, MapPin, User } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import { TicketPriorityBadge } from "./TicketPriorityBadge";
import { StatusBadge } from "@/components/common/data-display/StatusBadge";
import { cn } from "@/lib/utils";

interface TicketCardProps {
    ticket: Ticket;
    onClick?: (ticket: Ticket) => void;
    className?: string;
}

export function TicketCard({ ticket, onClick, className }: TicketCardProps) {
    return (
        <Card
            className={cn(
                "storm-surface cursor-pointer border-[rgba(255,192,56,0.72)] shadow-[0_10px_24px_rgba(0,24,88,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(0,20,78,0.38)]",
                className
            )}
            onClick={() => onClick?.(ticket)}
        >
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="text-sm font-semibold text-blue-100">
                            {ticket.ticket_number}
                        </div>
                        <div className="line-clamp-1 font-bold text-blue-50">
                            {ticket.utility_client}
                        </div>
                    </div>
                    <TicketPriorityBadge priority={ticket.priority} />
                </div>
            </CardHeader>
            <CardContent className="p-4 py-2 space-y-2">
                <div className="flex items-center text-sm text-blue-100">
                    <MapPin className="mr-2 h-3.5 w-3.5" />
                    <span className="line-clamp-1">{ticket.address}</span>
                </div>
                {ticket.scheduled_date && (
                    <div className="flex items-center text-sm text-blue-100">
                        <CalendarDays className="mr-2 h-3.5 w-3.5" />
                        <span>{formatDate(ticket.scheduled_date)}</span>
                    </div>
                )}
                {ticket.assigned_to && (
                    <div className="flex items-center text-sm text-blue-100">
                        <User className="mr-2 h-3.5 w-3.5" />
                        <span>Assigned</span>
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-4 pt-2 flex justify-between items-center">
                <StatusBadge status={ticket.status} />
            </CardFooter>
        </Card>
    );
}

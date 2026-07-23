"use client";

import { useEffect, useState } from "react";
import type { MarketingCalendarEvent } from "@/types/marketing";

type Props = { initialEvents?: MarketingCalendarEvent[] };

export function MarketingCalendar({ initialEvents = [] }: Props) {
  const [events, setEvents] = useState<MarketingCalendarEvent[]>(initialEvents);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/marketing/calendar");
        const data = await res.json();
        if (res.ok) setEvents(data.events ?? []);
      } catch {
        // optional
      }
    })();
  }, []);

  const grouped = events.reduce<Record<string, MarketingCalendarEvent[]>>((acc, e) => {
    const day = new Date(e.scheduled_at).toLocaleDateString();
    if (!acc[day]) acc[day] = [];
    acc[day].push(e);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <p className="text-sm text-white/40">
        Includes marketing events plus read-only Content Studio & Social Media schedules.
      </p>
      {Object.keys(grouped).length === 0 ? (
        <p className="text-sm text-white/30">No calendar events yet.</p>
      ) : (
        Object.entries(grouped).map(([day, dayEvents]) => (
          <div key={day} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <p className="text-xs font-medium uppercase text-white/40">{day}</p>
            <div className="mt-2 space-y-2">
              {dayEvents.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm">
                  <span className="text-white">{e.title}</span>
                  <span className="text-xs capitalize text-white/40">
                    {e.event_type} · {e.source}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

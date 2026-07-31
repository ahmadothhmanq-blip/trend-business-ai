import type { MaoeEvent, MaoeEventType } from "@/lib/ai-core/multi-agent-orchestration/maoe-types";

let eventCounter = 0;

export class MaoeEventBus {
  private events: MaoeEvent[] = [];

  emit(
    type: MaoeEventType,
    agentId?: MaoeEvent["agentId"],
    payload?: Record<string, unknown>,
  ): MaoeEvent {
    eventCounter += 1;
    const event: MaoeEvent = {
      id: `maoe-event-${Date.now()}-${eventCounter}`,
      type,
      agentId,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.events.push(event);
    return event;
  }

  getEvents(): MaoeEvent[] {
    return [...this.events];
  }

  drain(): MaoeEvent[] {
    const drained = [...this.events];
    this.events = [];
    return drained;
  }

  reset(): void {
    this.events = [];
    eventCounter = 0;
  }
}

export function resetMaoeEventCounter(): void {
  eventCounter = 0;
}

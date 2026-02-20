import dayjs from "dayjs";
import type { ChatMessage, TimelineItem } from "../types/chat";

export function formatTime(dateIso: string): string {
  return dayjs(dateIso).format("h:mm A");
}

export function formatDateLabel(dateIso: string): string {
  const date = dayjs(dateIso);
  if (date.isSame(dayjs(), "day")) {
    return "Today";
  }
  if (date.isSame(dayjs().subtract(1, "day"), "day")) {
    return "Yesterday";
  }
  return date.format("dddd, MMM D");
}

export function buildTimelineItems(messages: ChatMessage[]): TimelineItem[] {
  const sorted = [...messages].sort(
    (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
  );

  const timeline: TimelineItem[] = [];
  let previousDate = "";

  sorted.forEach((message) => {
    const currentDate = dayjs(message.createdAt).format("YYYY-MM-DD");
    if (currentDate !== previousDate) {
      previousDate = currentDate;
      timeline.push({
        type: "date",
        value: formatDateLabel(message.createdAt),
      });
    }

    timeline.push({
      type: "message",
      value: message,
    });
  });

  return timeline;
}

export function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

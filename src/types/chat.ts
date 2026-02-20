export type ProfileId = "alli" | "eddie";
export type ThemeMode = "light" | "dark";

export interface UserProfile {
  id: ProfileId;
  name: string;
  subtitle: string;
  avatar: string;
  accentClass: string;
}

export interface MessageReactionMap {
  [emoji: string]: ProfileId[];
}

export interface ChatMessage {
  id: string;
  authorId: ProfileId;
  text: string;
  createdAt: string;
  editedAt?: string;
  reactions: MessageReactionMap;
}

export interface TimelineDateItem {
  type: "date";
  value: string;
}

export interface TimelineMessageItem {
  type: "message";
  value: ChatMessage;
}

export type TimelineItem = TimelineDateItem | TimelineMessageItem;

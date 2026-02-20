import type { ProfileId, UserProfile } from "../types/chat";

export const PROFILES: UserProfile[] = [
  {
    id: "alli",
    name: "Alli",
    subtitle: "Student A",
    avatar: "📘",
    accentClass: "from-cyan-500 to-blue-500",
  },
  {
    id: "eddie",
    name: "Eddie",
    subtitle: "Student B",
    avatar: "📗",
    accentClass: "from-violet-500 to-fuchsia-500",
  },
];

export function getProfileById(profileId: ProfileId): UserProfile {
  const profile = PROFILES.find((item) => item.id === profileId);
  if (!profile) {
    throw new Error(`Unknown profile: ${profileId}`);
  }
  return profile;
}

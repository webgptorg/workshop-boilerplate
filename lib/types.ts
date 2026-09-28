export type Language = "en" | "cs";
export type Theme = "light" | "dark" | "system";
export type MeetingStatus = "scheduled" | "in-progress" | "completed";
export type Priority = "low" | "medium" | "high";

export interface User {
  id: string;
  name: string;
  email: string;
  language: Language;
  theme: Theme;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  languages: Language[];
  color: string;
  createdAt: string;
}

// Memberships are separate so collaboration can be added without changing ownership.
export interface Membership {
  userId: string;
  workspaceId: string;
  role: "owner" | "member";
}

export interface Recording {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  duration: number;
  createdAt: string;
  transcript?: string;
  liveTranscript?: string;
}

export interface Transcript {
  text: string;
  summary: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  date: string;
  duration: number;
  participants: string[];
  languages: Language[];
  status: MeetingStatus;
  color: "cyan" | "purple" | "orange" | "green";
  recordings: Recording[];
  transcript?: Transcript;
  processedText?: string;
  transcriptRecordingIds?: string[];
}

export interface Todo {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  priority: Priority;
  parentId: string | null;
  meetingIds: string[];
  createdAt: string;
}

export interface AppState {
  version: 1;
  user: User;
  workspaces: Workspace[];
  memberships: Membership[];
  meetings: Meeting[];
  todos: Todo[];
  onboardingDismissed: boolean;
}

export interface MeetingAnalysis {
  summary: string;
  todos: { title: string; description: string; dueDate: string }[];
}

export type Language = "en" | "cs";
export type CallCategory = "Meeting" | "Design" | "Team" | "Project";
export type Recording = {
  id: string;
  name: string;
  duration: number;
  type: string;
};
export type Call = {
  id: string;
  title: string;
  summary: string;
  date: string;
  duration: number;
  category: CallCategory;
  starred: boolean;
  participants: string[];
  notes: string;
  transcript: string;
  recordings: Recording[];
  language: string;
};
export type ActionItem = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  callIds: string[];
  parentId?: string;
  relatedIds: string[];
  dueDate: string;
  assignee: string;
  comments: { id: string; text: string; author: string; date: string }[];
  history: { text: string; date: string }[];
};
export type Workspace = {
  id: string;
  name: string;
  calls: Call[];
  actions: ActionItem[];
};
export type User = { id: string; name: string; email: string };
export type Account = User & { passwordHash?: string };
export type UserData = { workspaces: Workspace[] };
export const demoUsers: User[] = [
  { id: "alex", name: "Alex Morgan", email: "alex@minute.demo" },
  { id: "sarah", name: "Sarah Chen", email: "sarah@minute.demo" },
];

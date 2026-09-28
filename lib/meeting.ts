import type { Meeting, Workspace } from "./types";
import { uid } from "./utils";

export function createMeeting(workspace: Workspace, participantName: string, date = new Date()): Meeting {
  return {
    id: uid(),
    workspaceId: workspace.id,
    title: "",
    description: "",
    date: date.toISOString(),
    duration: 30,
    participants: [participantName],
    languages: workspace.languages,
    status: "scheduled",
    color: "cyan",
    recordings: [],
  };
}

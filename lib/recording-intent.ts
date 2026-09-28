let pendingMeetingId: string | null = null;

export function requestRecordingStart(meetingId: string) {
  pendingMeetingId = meetingId;
}

export function consumeRecordingStart(meetingId: string) {
  if (pendingMeetingId !== meetingId) return false;
  pendingMeetingId = null;
  return true;
}

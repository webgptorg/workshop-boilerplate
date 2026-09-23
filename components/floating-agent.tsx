"use client";

import {
  MockedChat,
  type ChatMessage,
  type ChatParticipant,
} from "@promptbook/components";
import { MessageCircle, X } from "lucide-react";
import { useState } from "react";

const participants: ChatParticipant[] = [
  {
    name: "USER",
    fullname: "You",
    isMe: true,
    color: "#30A8BD",
  },
  {
    name: "AGENT",
    fullname: "Promptbook Agent",
    color: "#30BDA8",
  },
];

const messages: ChatMessage[] = [
  {
    id: "1",
    sender: "AGENT",
    content: "Hi. I am the floating Promptbook agent.",
    isComplete: true,
  },
  {
    id: "2",
    sender: "AGENT",
    content: "Use this pattern for support, onboarding, or an app-specific assistant.",
    isComplete: true,
  },
];

export function FloatingAgent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="floating-agent">
      {isOpen ? (
        <div className="floating-agent-panel">
          <button
            className="floating-agent-close"
            type="button"
            aria-label="Close agent"
            onClick={() => setIsOpen(false)}
          >
            <X size={18} />
          </button>

          <MockedChat
            title="Promptbook Agent"
            layout="STANDALONE"
            style={{ height: "420px" }}
            messages={messages}
            participants={participants}
            delayConfig={{ blocky: true, showIntermediateMessages: messages.length }}
            placeholderMessageContent="Ask anything…"
            appendMessagesLocallyOnSend
            isFocusedOnLoad={false}
            isSaveButtonEnabled={false}
            isCopyButtonEnabled={false}
            isResettable={false}
            isPausable={false}
          />
        </div>
      ) : null}

      <button
        className="floating-agent-trigger"
        type="button"
        aria-label="Open Promptbook agent"
        onClick={() => setIsOpen((value) => !value)}
      >
        <MessageCircle size={22} />
        <span>Ask AI</span>
      </button>
    </div>
  );
}

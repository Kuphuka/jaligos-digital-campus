"use client";

import { FormEvent, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { schoolContacts, schoolEmail } from "@/lib/contact";

type ChatMessage = { from: "visitor" | "bot"; text: string };

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      from: "bot",
      text: `Hi! How can we help you today? WhatsApp us on ${schoolContacts[0].number} or email ${schoolEmail}.`,
    },
  ]);
  const [responding, setResponding] = useState(false);

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || responding) return;

    setMessages((current) => [...current, { from: "visitor", text }]);
    setInput("");
    setResponding(true);
    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { from: "bot", text: "Thanks for your message! Our team will be in touch shortly." },
      ]);
      setResponding(false);
    }, 650);
  }

  return (
    <div className="fixed bottom-3 right-3 z-[60] sm:bottom-5 sm:right-5">
      {open && (
        <section
          aria-label="Jaligos chat"
          className="mb-3 flex h-[min(28rem,calc(100vh-6rem))] w-[min(22rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-gold/40 bg-white shadow-2xl"
        >
          <header className="flex items-center justify-between bg-navy px-4 py-3 text-white">
            <div>
              <h2 className="font-serif text-lg font-bold text-gold">Jaligos Support</h2>
              <p className="text-xs text-white/75">We are happy to help</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="rounded p-2 hover:bg-white/10">
              <X size={18} />
            </button>
          </header>
          <div aria-live="polite" className="flex-1 space-y-3 overflow-y-auto bg-[#F8F9FA] p-4">
            {messages.map((message, index) => (
              <p
                key={`${index}-${message.from}`}
                className={`max-w-[90%] break-words rounded-xl px-3 py-2 text-sm ${
                  message.from === "visitor"
                    ? "ml-auto bg-navy text-white"
                    : "mr-auto border border-gold/30 bg-white text-navy"
                }`}
              >
                {message.text}
              </p>
            ))}
            {responding && <p className="text-xs text-slate-500">Jaligos is typing...</p>}
          </div>
          <form onSubmit={sendMessage} className="flex gap-2 border-t p-3">
            <input
              aria-label="Chat message"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your message..."
              className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gold"
            />
            <button
              type="submit"
              disabled={!input.trim() || responding}
              aria-label="Send message"
              className="rounded-lg bg-gold p-2 text-navy hover:bg-gold-dark disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        </section>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold text-navy shadow-lg transition hover:bg-gold-dark focus:outline-none focus:ring-4 focus:ring-gold/40"
      >
        {open ? <X size={24} /> : <MessageCircle size={26} />}
      </button>
    </div>
  );
}

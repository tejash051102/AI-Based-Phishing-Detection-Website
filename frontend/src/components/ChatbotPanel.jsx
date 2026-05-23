import { Bot, Send, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/client";

export default function ChatbotPanel() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [thread, setThread] = useState([
    { role: "assistant", text: "Ask me to explain phishing indicators, scan results, or next steps." }
  ]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (message.trim().length < 2) return;
    const current = message.trim();
    setThread((items) => [...items, { role: "user", text: current }]);
    setMessage("");
    setLoading(true);
    try {
      const { data } = await api.post("/chatbot", { message: current });
      setThread((items) => [...items, { role: "assistant", text: data.answer, suggestions: data.suggestions }]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Assistant unavailable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 grid h-12 w-12 place-items-center rounded bg-cyber-500 text-white shadow-glow lg:bottom-6"
        title="Open AI assistant"
      >
        <Bot size={22} />
      </button>
      {open && (
        <div className="fixed bottom-4 right-4 z-50 flex h-[520px] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold">
              <Bot className="text-cyber-500" size={20} /> AI security assistant
            </div>
            <button onClick={() => setOpen(false)} title="Close assistant">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {thread.map((item, index) => (
              <div key={`${item.role}-${index}`} className={`rounded p-3 text-sm ${item.role === "user" ? "ml-8 bg-cyber-500 text-white" : "mr-8 bg-slate-100 dark:bg-slate-900"}`}>
                <p>{item.text}</p>
                {item.suggestions?.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {item.suggestions.map((suggestion) => (
                      <p key={suggestion} className="text-xs opacity-80">- {suggestion}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="mr-8 rounded bg-slate-100 p-3 text-sm dark:bg-slate-900">Thinking...</div>}
          </div>
          <div className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-800">
            <input
              className="flex-1 rounded border border-slate-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-cyber-500 dark:border-slate-800"
              placeholder="Ask about phishing signs..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && send()}
            />
            <button onClick={send} className="rounded bg-cyber-500 px-3 text-white" title="Send message">
              <Send size={17} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}


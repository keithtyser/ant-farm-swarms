// src/App.tsx
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface ChatMsg {
  room: string;
  sender: string;
  text: string;
  ts: number;
}

export default function App() {
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);

  useEffect(() => {
    // Connect once when the component mounts
    const socket: Socket = io(import.meta.env.VITE_WS_URL || "http://localhost:8000");

    socket.on("chat", (m: ChatMsg) => {
      // Keep only the last 100 messages
      setMsgs(prev => [...prev.slice(-100), m]);
    });

    // Clean‑up: disconnect, but ensure the returned value of
    // the effect callback is void (TypeScript requirement).
    return () => {
      socket.disconnect(); // <- returns Socket, but we ignore it
    };
  }, []);

  return (
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ant‑Farm Swarm</h1>

      <ul className="space-y-1 text-sm">
        {msgs.map((m, idx) => (
          <li key={idx}>
            <b>{m.sender}</b>: {m.text}
          </li>
        ))}
      </ul>
    </main>
  );
}

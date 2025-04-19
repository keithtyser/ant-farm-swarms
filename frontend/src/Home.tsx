import { useEffect, useState } from "react";
import io from "socket.io-client";

type ChatMsg = { sender: string; text: string };

export default function Home() {
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);

  useEffect(() => {
    const socket = io("http://localhost:8000");
    socket.on("chat", (m: ChatMsg) => setMsgs((prev) => [...prev, m]));
    return () => { socket.disconnect(); };           // ← proper cleanup
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Ant‑Farm Swarm</h1>

      <ul>
        {msgs.map((m, i) => (
          <li key={i}>
            <strong>{m.sender}</strong>: {m.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

// frontend/src/Graph.tsx
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import * as d3 from "d3-force";

interface ChatMsg {
  room: string;
  sender: string;
  text: string;
  ts: number;
  role: string;
  textid: string;
}

/* ------------------------------------------------------------------ */
/*  D3 types                                                           */
/* ------------------------------------------------------------------ */
interface Node extends d3.SimulationNodeDatum {
  id: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: Node | string;
  target: Node | string;
}

/* ------------------------------------------------------------------ */
/*  React component                                                    */
/* ------------------------------------------------------------------ */
export default function Graph() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    /* ---------- basics ---------- */
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    /* ---------- graph data ---------- */
    const nodeMap = new Map<string, Node>();
    const nodes: Node[] = [];
    const links: Link[] = [];
    let lastSender: string | null = null;

    /* ---------- D3 simulation ---------- */
    const linkForce = d3
      .forceLink<Node, Link>(links)
      .id((d) => d.id)
      .distance(120);

    const sim = d3
      .forceSimulation<Node>(nodes)
      .force("charge", d3.forceManyBody().strength(-180))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("link", linkForce)
      .on("tick", draw);

    /* ---------- drawing ---------- */
    function draw() {
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = "#999";
      links.forEach((l) => {
        const s = l.source as Node;
        const t = l.target as Node;
        ctx.beginPath();
        ctx.moveTo(s.x!, s.y!);
        ctx.lineTo(t.x!, t.y!);
        ctx.stroke();
      });

      ctx.fillStyle = "#1e90ff";
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x!, n.y!, 6, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    /* ---------- Socket.IO ---------- */
    const socket: Socket = io("http://localhost:8000"); // back‑end URL

    socket.on("chat", (m: ChatMsg) => {
      /* create node for every unique sender */
      if (!nodeMap.has(m.sender)) {
        const n: Node = { id: m.sender };
        nodeMap.set(m.sender, n);
        nodes.push(n);
      }

      /* link this sender to the previous one */
      if (lastSender && lastSender !== m.sender) {
        links.push({ source: lastSender, target: m.sender });
      }
      lastSender = m.sender;

      /* ✨ refresh simulation ✨ */
      linkForce.links(links);
      sim.nodes(nodes);
      sim.alpha(1).restart();
    });

    /* ---------- cleanup ---------- */
    return () => {
      socket.disconnect();
      sim.stop();
    };
  }, []);

  return <canvas ref={canvasRef} style={{ display: "block" }} />;
}

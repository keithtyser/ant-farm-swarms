from __future__ import annotations

import asyncio

import socketio
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware

from .bridge import push, consume
from .schema import ChatMsg

from . import worker_mgr


# ── Socket.IO server (CORS * so React dev server can connect) ────────────────
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

# Under‑the‑hood FastAPI instance for REST endpoints
api = FastAPI()
api.add_middleware(CORSMiddleware, allow_origins=["*"])

# Wrap both together as a single ASGI app (exported as `app`)
app = socketio.ASGIApp(sio, api)


@api.on_event("startup")
async def forward_stream_to_ws() -> None:
    """Background task: read Redis Stream and broadcast to browsers."""
    async def _worker() -> None:
        async for msg in consume():
            await sio.emit("chat", msg.__dict__)

    asyncio.create_task(_worker())


# ── Simple health endpoint ----------------------------------------------------
@api.get("/")
async def root() -> dict[str, str]:
    return {"status": "ant farm running"}


# ── REST endpoint to inject a new message ------------------------------------
@api.post("/post")
async def post(msg: ChatMsg) -> dict[str, bool]:
    await push(msg)
    return {"ok": True}

@api.post("/agents")
async def agents(action: dict = Body(...)):
    match action.get("action"):
        case "spawn":
            worker_mgr.spawn()
            return {"status": "spawned"}
        case "kill":
            worker_mgr.kill()
            return {"status": "killed"}
    return {"error": "unknown action"}
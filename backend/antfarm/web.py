from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio

from .bridge import push, consume
from .schema import ChatMsg

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"])

@app.get("/")
async def root():
    return {"status": "ant farm running"}

@app.post("/post")
async def post(msg: ChatMsg):
    await push(msg)
    return {"ok": True}

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    # start streaming new messages
    async for msg in consume():
        await ws.send_json(msg.__dict__)

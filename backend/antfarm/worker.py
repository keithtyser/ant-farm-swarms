from __future__ import annotations

import asyncio
import os
import random
import sys
import time
from typing import Set

from redis.exceptions import BusyLoadingError, ConnectionError

from .bridge import push, consume
from .schema import ChatMsg

AGENT_NAME = os.getenv("AGENT_NAME", f"agent-{random.randint(1000, 9999)}")
COOLDOWN = 1.0  # seconds between this agent’s replies
RECENT_TTL = 30  # seconds to remember handled message‑ids

recent: dict[str, float] = {}  # msg_id -> timestamp of last reply


async def push_with_retry(msg: ChatMsg, retries: int = 20) -> None:
    """Push to Redis, retrying while the server is loading."""
    for _ in range(retries):
        try:
            await push(msg)
            print(f"[{AGENT_NAME}] sent: {msg.text}", flush=True)
            return
        except (BusyLoadingError, ConnectionError):
            await asyncio.sleep(0.3)
    print("Redis never became ready — giving up", file=sys.stderr)
    sys.exit(1)


async def run_agent() -> None:
    # greet once (role=agent)
    await push_with_retry(
        ChatMsg(room="global", sender=AGENT_NAME, text="Hello, world!", role="agent")
    )

    last_sent = 0.0
    async for incoming in consume():
        now = time.time()

        # cleanup old recent ids
        for mid, ts in list(recent.items()):
            if now - ts > RECENT_TTL:
                del recent[mid]

        # ignore own or duplicate / agent messages
        if (
            incoming.sender == AGENT_NAME
            or incoming.textid in recent
            or incoming.role != "human"
        ):
            continue

        if now - last_sent < COOLDOWN:
            await asyncio.sleep(COOLDOWN - (now - last_sent))

        reply = ChatMsg(
            room=incoming.room,
            sender=AGENT_NAME,
            text=f"{incoming.sender}: I hear you!",
            role="agent",
        )
        await push(reply)
        recent[incoming.textid] = now
        last_sent = now
        print(f"[{AGENT_NAME}] replied to {incoming.sender}", flush=True)


if __name__ == "__main__":  # pragma: no cover
    asyncio.run(run_agent())

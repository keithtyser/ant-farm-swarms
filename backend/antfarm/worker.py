import asyncio, os, random, sys
from redis.exceptions import BusyLoadingError, ConnectionError
from .bridge import push, consume
from .schema import ChatMsg

AGENT_NAME = os.getenv("AGENT_NAME", f"agent-{random.randint(1000,9999)}")


async def push_with_retry(msg: ChatMsg, retries: int = 20):
    """Try to push to Redis, retrying while it is still loading."""
    for attempt in range(retries):
        try:
            await push(msg)
            print(f"[{AGENT_NAME}] sent: {msg.text}", flush=True)
            return
        except (BusyLoadingError, ConnectionError):
            await asyncio.sleep(0.3)  # wait 300 ms and retry
    print("Redis never became ready — giving up", file=sys.stderr)
    sys.exit(1)


async def run_agent():
    # greet once
    await push_with_retry(
        ChatMsg(room="global", sender=AGENT_NAME, text="Hello, world!")
    )

    async for incoming in consume():
        if incoming.sender == AGENT_NAME:
            continue
        reply = ChatMsg(
            room=incoming.room,
            sender=AGENT_NAME,
            text=f"{incoming.sender}: I hear you!",
        )
        await push(reply)
        print(f"[{AGENT_NAME}] replied to {incoming.sender}", flush=True)  


if __name__ == "__main__":
    asyncio.run(run_agent())

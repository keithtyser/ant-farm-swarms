import asyncio, os, redis.asyncio as redis
from .schema import ChatMsg, STREAM_NAME

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
r = redis.from_url(REDIS_URL, decode_responses=False)

async def push(msg: ChatMsg):
    await r.xadd(STREAM_NAME, msg.to_redis())

async def consume(start_id: str = "$"):
    last_id = start_id
    while True:
        res = await r.xread({STREAM_NAME: last_id}, block=0)
        if res:
            _, entries = res[0]
            for entry_id, data in entries:
                last_id = entry_id
                yield ChatMsg.from_redis(data)

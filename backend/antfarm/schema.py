from __future__ import annotations
from dataclasses import dataclass, asdict
import time, json

STREAM_NAME = "messages"

@dataclass
class ChatMsg:
    room: str
    sender: str
    text: str
    ts: float = time.time()

    def to_redis(self) -> dict[str, str]:
        return {"json": json.dumps(asdict(self))}

    @staticmethod
    def from_redis(d: dict[str, bytes]) -> "ChatMsg":
        return ChatMsg(**json.loads(d[b"json"].decode()))

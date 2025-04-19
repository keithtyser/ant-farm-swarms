from __future__ import annotations

import json
import time
from dataclasses import dataclass, asdict, field

STREAM_NAME = "messages"


@dataclass
class ChatMsg:
    # ── core fields ───────────────────────────────────────────────
    room: str
    sender: str
    text: str

    # ── metadata ─────────────────────────────────────────────────
    ts: float = field(default_factory=lambda: time.time())
    role: str = "human"          # "human" | "agent"
    textid: str = field(init=False)

    # ── derive textid after construction ─────────────────────────
    def __post_init__(self) -> None:
        self.textid = f"{self.sender}:{self.ts}"

    # ── helpers for Redis Streams ────────────────────────────────
    def to_redis(self) -> dict[str, str]:
        """Serialize to a single‑field hash so XADD stores JSON."""
        return {"json": json.dumps(asdict(self), separators=(",", ":"))}

    @staticmethod
    def from_redis(d: dict[bytes, bytes]) -> "ChatMsg":
        """
        Safely deserialize from the Stream entry.
        Ignores keys that are not accepted by __init__ (e.g. *textid*).
        """
        payload: dict = json.loads(d[b"json"].decode())

        # Remove keys that are *init=False* or otherwise unknown
        safe_keys = {"room", "sender", "text", "ts", "role"}
        init_kwargs = {k: v for k, v in payload.items() if k in safe_keys}

        msg = ChatMsg(**init_kwargs)           # construct instance
        msg.textid = payload.get("textid", msg.textid)  # restore if present
        return msg

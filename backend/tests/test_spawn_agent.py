# backend/tests/test_spawn_agent.py
import pytest, httpx, asyncio
from antfarm.web import api as app

@pytest.mark.asyncio
async def test_spawn(tmp_path):
    async with httpx.AsyncClient(app=app, base_url="http://test") as c:
        r = await c.post("/agents", json={"action": "spawn"})
        assert r.json()["status"] == "spawned"

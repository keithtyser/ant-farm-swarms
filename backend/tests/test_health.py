import asyncio
from httpx import AsyncClient
from antfarm.web import api as app   # FastAPI instance

async def test_root_returns_ok():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        r = await ac.get("/")
    assert r.status_code == 200
    assert r.json() == {"status": "ant farm running"}

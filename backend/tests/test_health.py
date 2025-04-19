import pytest
from antfarm.web import api as app   # FastAPI instance
from fastapi.testclient import TestClient

@pytest.mark.asyncio
async def test_root_returns_ok():
    client = TestClient(app)
    resp = client.get("/")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ant farm running"}
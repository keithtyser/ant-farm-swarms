# backend/antfarm/worker_mgr.py
import subprocess, sys, pathlib, os

PROCS = []

def spawn():
    p = subprocess.Popen([sys.executable, "-m", "antfarm.worker"], cwd=pathlib.Path(__file__).parent.parent)
    PROCS.append(p)

def kill():
    if PROCS:
        p = PROCS.pop()
        p.terminate()

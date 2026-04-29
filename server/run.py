"""Entry point for the Sound Sculptor Flask backend.

Usage:
    python -m server.run
    # or from the server/ directory:
    python run.py
"""
import sys
import os

# Allow running as `python run.py` from inside server/
if __name__ == '__main__':
    parent = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if parent not in sys.path:
        sys.path.insert(0, parent)

from server.app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)

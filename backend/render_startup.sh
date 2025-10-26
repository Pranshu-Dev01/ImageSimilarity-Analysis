#!/bin/bash
# This script tells Render how to start your Flask app using Gunicorn

# Exit immediately if a command exits with a non-zero status.
set -e

# Start the Gunicorn server.
# "app:app" means: In the file "app.py", find the Flask object named "app".
gunicorn app:app
#!/bin/bash
# Keep-alive script — pings the API every 5 minutes
# Prevents Oracle Cloud from reclaiming idle Always Free ARM instances
# Install: crontab -e → add: */5 * * * * /home/ubuntu/myntra-dashboard/keep-alive.sh

curl -sf http://localhost:80/api/v1/dashboard/metrics > /dev/null 2>&1 || true

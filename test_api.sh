#!/bin/bash
URL="http://localhost:3000/bookings"

echo "1. Luodaan onnistunut varaus..."
curl -s -X POST $URL -H "Content-Type: application/json" \
-d '{"room_name": "Aalto", "start_time": "2026-10-10T10:00:00", "end_time": "2026-10-10T12:00:00"}'
echo -e "\n"

echo "2. Yritetään päällekkäistä varausta (pitäisi antaa virhe 409)..."
curl -s -X POST $URL -H "Content-Type: application/json" \
-d '{"room_name": "Aalto", "start_time": "2026-10-10T11:00:00", "end_time": "2026-10-10T13:00:00"}'
echo -e "\n"

echo "3. Haetaan huoneen varaukset..."
curl -s $URL/Aalto
echo -e "\n"
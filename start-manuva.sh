#!/bin/bash

echo "=========================================="
echo "   Manuva Project Startup Script"
echo "=========================================="
echo ""

# Check if PostgreSQL is running
if ! pgrep -x "postgres" > /dev/null
then
    echo "⚠️  Warning: PostgreSQL doesn't seem to be running!"
    echo "Please start PostgreSQL first:"
    echo "  - Mac: brew services start postgresql@15"
    echo "  - Linux: sudo systemctl start postgresql"
    echo ""
    read -p "Press Enter to continue anyway or Ctrl+C to cancel..."
fi

echo "Starting Backend Server..."
cd manuva-backend
gnome-terminal --tab --title="Manuva Backend" -- bash -c "npm run dev; exec bash" 2>/dev/null || \
osascript -e 'tell application "Terminal" to do script "cd '"$PWD"' && npm run dev"' 2>/dev/null || \
xterm -T "Manuva Backend" -e "npm run dev" 2>/dev/null &

sleep 3

echo "Starting Frontend Server..."
cd ../manuva-frontend
gnome-terminal --tab --title="Manuva Frontend" -- bash -c "npm run dev; exec bash" 2>/dev/null || \
osascript -e 'tell application "Terminal" to do script "cd '"$PWD"' && npm run dev"' 2>/dev/null || \
xterm -T "Manuva Frontend" -e "npm run dev" 2>/dev/null &

echo ""
echo "=========================================="
echo "   Both servers are starting..."
echo "   Backend:  http://localhost:3000"
echo "   Frontend: http://localhost:3001"
echo "=========================================="
echo ""
echo "Check the new terminal windows for server logs"
echo "Press Ctrl+C in those windows to stop the servers"

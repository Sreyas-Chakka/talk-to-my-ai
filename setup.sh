#!/bin/bash

echo "🚀 Starting Voice Demo AI Application..."
echo ""

# Check if in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the voice-demo root directory"
    exit 1
fi

echo "📦 Backend Setup"
echo "=================="
cd backend

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
echo "Installing backend dependencies..."
pip install -q -r requirements.txt

echo "✅ Backend ready"
echo ""

cd ..

echo "📦 Frontend Setup"
echo "=================="
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install -q
else
    echo "Frontend dependencies already installed"
fi

echo "✅ Frontend ready"
cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "==========="
echo "1. Terminal 1 - Auth Service (port 8001):"
echo "   cd backend && source venv/bin/activate && python auth.py"
echo ""
echo "2. Terminal 2 - Chatbot Service (port 8000):"
echo "   cd backend && source venv/bin/activate && python main.py"
echo ""
echo "3. Terminal 3 - Frontend (port 3000):"
echo "   cd frontend && npm run dev"
echo ""
echo "4. Open browser:"
echo "   http://localhost:3000"
echo ""
echo "Demo credentials:"
echo "  Email: test@example.com"
echo "  Password: password123"

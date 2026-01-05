#!/bin/bash
set -e

SERVER="root@137.184.183.142"
APP_DIR="/opt/commodex-server"
REPO="https://github.com/codenlighten/commodex-server.git"

echo "🚀 Deploying to production server..."

# SSH into server and deploy
ssh $SERVER << 'ENDSSH'
set -e

# Install dependencies if needed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

if ! command -v psql &> /dev/null; then
    echo "📦 Installing PostgreSQL..."
    apt-get update
    apt-get install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
fi

if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Clone or pull repository
if [ ! -d "/opt/commodex-server" ]; then
    echo "📥 Cloning repository..."
    cd /opt
    git clone https://github.com/codenlighten/commodex-server.git
else
    echo "🔄 Updating repository..."
    cd /opt/commodex-server
    git pull origin main
fi

cd /opt/commodex-server

# Install dependencies
echo "📦 Installing npm packages..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run prisma:generate

echo "✅ Code deployed successfully!"
echo ""
echo "⚠️  NEXT STEPS (manual):"
echo "1. ssh root@137.184.183.142"
echo "2. cd /opt/commodex-server"
echo "3. Create .env file with production values"
echo "4. Set up PostgreSQL database and user"
echo "5. npm run prisma:migrate"
echo "6. pm2 start npm --name commodex -- run start:prod"
echo "7. pm2 save && pm2 startup"

ENDSSH

echo ""
echo "✅ Deployment script completed!"

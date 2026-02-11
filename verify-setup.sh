#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║   Korean TOPIK Learning App - System Verification         ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

ERRORS=0

# Function to check command
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is NOT installed"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

# Function to check service
check_service() {
    if docker compose ps | grep -q $1; then
        echo -e "${GREEN}✓${NC} $1 is running"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is NOT running"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

echo -e "${YELLOW}[1/6] Checking System Requirements...${NC}"
check_command "node"
check_command "npm"
check_command "docker"
check_command "docker-compose" || check_command "docker compose"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "      Node version: $NODE_VERSION"
fi

echo ""
echo -e "${YELLOW}[2/6] Checking Docker Services...${NC}"
cd "$(dirname "$0")"

if docker compose ps &> /dev/null; then
    check_service "postgres"
    check_service "pgadmin"
else
    echo -e "${RED}✗${NC} Docker services not running. Run 'docker compose up -d'"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo -e "${YELLOW}[3/6] Checking Database Connection...${NC}"
if docker exec topik-postgres psql -U topik_user -d topik_learning_db -c "SELECT 1" &> /dev/null; then
    echo -e "${GREEN}✓${NC} PostgreSQL connection successful"
    
    # Get counts
    VOCAB_COUNT=$(docker exec topik-postgres psql -U topik_user -d topik_learning_db -t -c "SELECT COUNT(*) FROM vocabulary;" 2>/dev/null | tr -d ' ')
    echo "      Vocabulary count: $VOCAB_COUNT"
else
    echo -e "${RED}✗${NC} Cannot connect to PostgreSQL"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo -e "${YELLOW}[4/6] Checking Node Modules...${NC}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules exists"
    
    # Check important packages
    if [ -d "node_modules/@prisma/client" ]; then
        echo -e "${GREEN}✓${NC} Prisma Client installed"
    else
        echo -e "${RED}✗${NC} Prisma Client not found. Run 'npm install'"
        ERRORS=$((ERRORS + 1))
    fi
    
    if [ -d "node_modules/next" ]; then
        echo -e "${GREEN}✓${NC} Next.js installed"
    else
        echo -e "${RED}✗${NC} Next.js not found. Run 'npm install'"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗${NC} node_modules not found. Run 'npm install'"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo -e "${YELLOW}[5/6] Checking Environment Configuration...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    
    # Check for required variables
    if grep -q "DATABASE_URL" .env; then
        echo -e "${GREEN}✓${NC} DATABASE_URL configured"
    else
        echo -e "${RED}✗${NC} DATABASE_URL not found in .env"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗${NC} .env file not found. Copy from .env.example"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo -e "${YELLOW}[6/6] Checking Prisma Setup...${NC}"
if [ -f "prisma/schema.prisma" ]; then
    echo -e "${GREEN}✓${NC} Prisma schema exists"
    
    # Validate schema
    if npx prisma validate &> /dev/null; then
        echo -e "${GREEN}✓${NC} Prisma schema is valid"
    else
        echo -e "${RED}✗${NC} Prisma schema validation failed"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check migrations
    if [ -d "prisma/migrations" ]; then
        MIGRATION_COUNT=$(ls -1 prisma/migrations | wc -l)
        echo -e "${GREEN}✓${NC} Migrations directory exists ($MIGRATION_COUNT migrations)"
    else
        echo -e "${YELLOW}⚠${NC} No migrations found. Run 'npm run prisma:migrate'"
    fi
else
    echo -e "${RED}✗${NC} Prisma schema not found"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! System is ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Start development: ${BLUE}make dev${NC} or ${BLUE}npm run dev${NC}"
    echo "  2. Open browser: ${BLUE}http://localhost:3000${NC}"
    echo "  3. Access PgAdmin: ${BLUE}http://localhost:5050${NC}"
    echo "  4. Open Prisma Studio: ${BLUE}make db-studio${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Found $ERRORS error(s). Please fix them before proceeding.${NC}"
    echo ""
    echo "Common fixes:"
    echo "  • Install dependencies: ${BLUE}npm install${NC}"
    echo "  • Start Docker: ${BLUE}docker compose up -d${NC}"
    echo "  • Run migrations: ${BLUE}npm run prisma:migrate${NC}"
    echo "  • Seed database: ${BLUE}npm run prisma:seed${NC}"
    echo "  • Full setup: ${BLUE}make setup${NC}"
    echo ""
    exit 1
fi

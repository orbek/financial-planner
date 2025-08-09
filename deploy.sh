#!/bin/bash

# Financial Planner Deployment Script
# Usage: ./deploy.sh [environment]
# Environments: dev, staging, production

set -e

ENVIRONMENT=${1:-production}
echo "🚀 Deploying Financial Planner to $ENVIRONMENT environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if environment files exist
    if [ "$ENVIRONMENT" = "production" ]; then
        if [ ! -f "client/.env.production" ]; then
            log_warning "client/.env.production not found. Please create it from client/.env.production.example"
        fi
        if [ ! -f "server/.env.production" ]; then
            log_warning "server/.env.production not found. Please create it from server/.env.production.example"
        fi
    fi
    
    log_success "Prerequisites check completed"
}

# Build application
build_app() {
    log_info "Building application..."
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm run install-all
    
    # Run tests
    log_info "Running tests..."
    cd client && npm test -- --watchAll=false && cd ..
    cd server && npm test && cd ..
    
    # Build client
    log_info "Building client..."
    cd client && npm run build && cd ..
    
    # Build server
    log_info "Building server..."
    cd server && npm run build && cd ..
    
    log_success "Application built successfully"
}

# Deploy with Docker
deploy_docker() {
    log_info "Deploying with Docker..."
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose -f docker-compose.prod.yml down || true
    
    # Build and start containers
    log_info "Building and starting containers..."
    docker-compose -f docker-compose.prod.yml up -d --build
    
    # Wait for services to be ready
    log_info "Waiting for services to start..."
    sleep 30
    
    # Health check
    log_info "Performing health check..."
    if curl -f http://localhost/health > /dev/null 2>&1; then
        log_success "Frontend health check passed"
    else
        log_warning "Frontend health check failed"
    fi
    
    if curl -f http://localhost/api/health > /dev/null 2>&1; then
        log_success "Backend health check passed"
    else
        log_warning "Backend health check failed"
    fi
    
    log_success "Docker deployment completed"
}

# Deploy to cloud platform
deploy_cloud() {
    case "$ENVIRONMENT" in
        "vercel")
            log_info "Deploying to Vercel..."
            cd client
            npx vercel --prod
            cd ..
            ;;
        "netlify")
            log_info "Deploying to Netlify..."
            cd client
            npm run build
            # You would add Netlify CLI deployment here
            cd ..
            ;;
        "heroku")
            log_info "Deploying to Heroku..."
            cd server
            git push heroku main
            cd ..
            ;;
        *)
            log_warning "Cloud platform '$ENVIRONMENT' not supported in this script"
            ;;
    esac
}

# Setup SSL
setup_ssl() {
    log_info "Setting up SSL certificates..."
    
    if [ ! -d "ssl" ]; then
        mkdir ssl
        log_info "Created ssl directory"
        log_warning "Please add your SSL certificates to the ssl/ directory"
        log_warning "Required files: cert.pem, key.pem"
    fi
}

# Database setup
setup_database() {
    log_info "Setting up database..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "For production, ensure your Supabase project is configured"
        log_info "Database migrations should be run manually in Supabase SQL editor"
    else
        # Local database setup
        if docker-compose -f docker-compose.dev.yml ps postgres | grep -q "Up"; then
            log_info "Running database migrations..."
            npm run db:setup
            npm run db:seed
        else
            log_warning "Local database is not running. Start it with: npm run dev:db"
        fi
    fi
}

# Backup
backup_data() {
    log_info "Creating backup..."
    
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup environment files
    cp -r client/.env* "$BACKUP_DIR/" 2>/dev/null || true
    cp -r server/.env* "$BACKUP_DIR/" 2>/dev/null || true
    
    # Backup docker-compose files
    cp docker-compose*.yml "$BACKUP_DIR/"
    
    log_success "Backup created in $BACKUP_DIR"
}

# Rollback
rollback() {
    log_info "Rolling back deployment..."
    
    # Stop current containers
    docker-compose -f docker-compose.prod.yml down
    
    # You would implement rollback logic here
    log_warning "Rollback functionality needs to be implemented based on your deployment strategy"
}

# Main deployment flow
main() {
    case "$1" in
        "rollback")
            rollback
            ;;
        "backup")
            backup_data
            ;;
        "ssl")
            setup_ssl
            ;;
        "db")
            setup_database
            ;;
        *)
            check_prerequisites
            backup_data
            
            if [ "$ENVIRONMENT" = "production" ] || [ "$ENVIRONMENT" = "staging" ]; then
                build_app
                setup_ssl
                deploy_docker
            elif [[ "$ENVIRONMENT" =~ ^(vercel|netlify|heroku)$ ]]; then
                build_app
                deploy_cloud
            else
                log_error "Unknown environment: $ENVIRONMENT"
                echo "Usage: $0 [production|staging|vercel|netlify|heroku|rollback|backup|ssl|db]"
                exit 1
            fi
            
            log_success "🎉 Deployment to $ENVIRONMENT completed successfully!"
            log_info "Application should be available at:"
            if [ "$ENVIRONMENT" = "production" ]; then
                log_info "  Frontend: https://your-domain.com"
                log_info "  Backend:  https://your-domain.com/api"
            else
                log_info "  Frontend: http://localhost"
                log_info "  Backend:  http://localhost/api"
            fi
            ;;
    esac
}

# Run main function with all arguments
main "$@"

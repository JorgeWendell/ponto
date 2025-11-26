#!/bin/bash

# Script de Deploy Completamente Automatizado - Next.js
# Ubuntu 24.04
# Não requer interação do usuário

set -e

APP_DIR="/var/www/ponto"
APP_NAME="ponto"
REPO_URL="https://github.com/JorgeWendell/ponto.git"
DOMAIN="${DOMAIN:-localhost}"  # Pode ser configurado via variável de ambiente
PORT="${PORT:-3000}"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Funções auxiliares
print_step() {
    echo -e "${BLUE}[*] $1${NC}"
}

print_success() {
    echo -e "${GREEN}[✓] $1${NC}"
}

print_error() {
    echo -e "${RED}[✗] $1${NC}"
}

print_info() {
    echo -e "${YELLOW}[!] $1${NC}"
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    print_error "Por favor, execute como root (sudo ./deploy_auto.sh)"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deploy Automatizado - Next.js Ponto${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# ============================================
# Passo 1: Atualizar sistema
# ============================================
print_step "Atualizando sistema..."
export DEBIAN_FRONTEND=noninteractive
apt update -qq > /dev/null 2>&1
apt upgrade -y -qq > /dev/null 2>&1
print_success "Sistema atualizado"

# ============================================
# Passo 2: Instalar dependências do sistema
# ============================================
print_step "Instalando dependências do sistema..."
apt install -y \
    curl \
    git \
    build-essential \
    nginx \
    ufw \
    > /dev/null 2>&1
print_success "Dependências do sistema instaladas"

# ============================================
# Passo 3: Instalar Node.js (se não estiver instalado)
# ============================================
print_step "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_step "Instalando Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
    apt install -y nodejs > /dev/null 2>&1
fi

NODE_VERSION=$(node -v)
print_success "Node.js instalado: $NODE_VERSION"

# ============================================
# Passo 4: Instalar PM2 (se não estiver instalado)
# ============================================
print_step "Verificando PM2..."
if ! command -v pm2 &> /dev/null; then
    print_step "Instalando PM2..."
    npm install -g pm2 > /dev/null 2>&1
fi
print_success "PM2 instalado"

# ============================================
# Passo 5: Criar diretório e clonar repositório
# ============================================
print_step "Preparando diretório da aplicação..."
mkdir -p /var/www
cd /var/www

if [ -d "$APP_DIR" ]; then
    print_info "Diretório já existe, fazendo backup..."
    if [ -d "${APP_DIR}.backup" ]; then
        rm -rf "${APP_DIR}.backup"
    fi
    mv "$APP_DIR" "${APP_DIR}.backup" 2>/dev/null || true
fi

if [ -d "$APP_DIR/.git" ]; then
    print_info "Repositório já existe, atualizando..."
    cd "$APP_DIR"
    git pull origin main > /dev/null 2>&1 || git pull origin master > /dev/null 2>&1 || true
else
    print_step "Clonando repositório..."
    git clone "$REPO_URL" "$APP_DIR" > /dev/null 2>&1 || {
        print_error "Erro ao clonar repositório. Verifique a URL: $REPO_URL"
        exit 1
    }
fi

cd "$APP_DIR"
chown -R $SUDO_USER:$SUDO_USER "$APP_DIR" 2>/dev/null || true
print_success "Diretório preparado"

# ============================================
# Passo 6: Instalar dependências Node.js
# ============================================
print_step "Instalando dependências Node.js..."

# Verificar estrutura do projeto (pode estar em ponto/ponto ou na raiz)
FINAL_APP_DIR="$APP_DIR"
if [ -d "$APP_DIR/ponto" ] && [ -f "$APP_DIR/ponto/package.json" ]; then
    cd "$APP_DIR/ponto"
    FINAL_APP_DIR="$APP_DIR/ponto"
elif [ -f "$APP_DIR/package.json" ]; then
    cd "$APP_DIR"
    FINAL_APP_DIR="$APP_DIR"
else
    print_error "package.json não encontrado em $APP_DIR ou $APP_DIR/ponto"
    exit 1
fi

print_info "Diretório do projeto: $FINAL_APP_DIR"

npm install --production=false > /dev/null 2>&1
print_success "Dependências instaladas"

# ============================================
# Passo 7: Configurar arquivo .env
# ============================================
print_step "Configurando arquivo .env..."

# Verificar se já existe .env
if [ -f ".env.local" ]; then
    print_info "Arquivo .env.local já existe, mantendo..."
elif [ -f ".env" ]; then
    print_info "Arquivo .env já existe, mantendo..."
else
    print_step "Criando arquivo .env..."
    cat > .env.local << 'EOF'
# Database
DATABASE_URL=postgresql://usuario:senha@localhost:5432/ponto

# NextAuth / Better Auth
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key-change-this-in-production

# Nextcloud
NEXTCLOUD_WEBDAV_URL=http://192.168.15.10/remote.php/dav/files/Ponto
NEXTCLOUD_USER=ponto
NEXTCLOUD_PASSWORD=Lucas@120908

# Face Recognition Service
FACE_RECOGNITION_API_URL=http://192.168.15.12:9090

# Node Environment
NODE_ENV=production
EOF
    chmod 600 .env.local
    print_success "Arquivo .env.local criado"
    print_info "IMPORTANTE: Edite .env.local e configure as variáveis de ambiente!"
fi

# ============================================
# Passo 8: Fazer build da aplicação
# ============================================
print_step "Fazendo build da aplicação (isso pode levar alguns minutos)..."
npm run build > /tmp/ponto_build.log 2>&1 || {
    print_error "Erro ao fazer build. Verifique /tmp/ponto_build.log"
    tail -20 /tmp/ponto_build.log
    exit 1
}
print_success "Build concluído"

# ============================================
# Passo 9: Configurar PM2
# ============================================
print_step "Configurando PM2..."

# Criar ecosystem.config.js se não existir
if [ ! -f "ecosystem.config.js" ]; then
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: '$APP_NAME',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -H 0.0.0.0 -p $PORT',
      cwd: '$APP_DIR',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: '$PORT',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
EOF
fi

# Atualizar caminhos no ecosystem.config.js
sed -i "s|/var/www/ponto|$APP_DIR|g" ecosystem.config.js 2>/dev/null || true

# Criar diretório de logs
mkdir -p logs

# Parar serviço existente se estiver rodando
pm2 delete "$APP_NAME" > /dev/null 2>&1 || true

# Iniciar com PM2
cd "$FINAL_APP_DIR"
pm2 start ecosystem.config.js > /dev/null 2>&1 || pm2 start npm --name "$APP_NAME" -- start > /dev/null 2>&1
pm2 save > /dev/null 2>&1

# Configurar PM2 para iniciar no boot
print_step "Configurando PM2 para iniciar no boot..."
pm2 startup systemd -u $SUDO_USER --hp /home/$SUDO_USER > /tmp/pm2_startup.txt 2>&1 || true
STARTUP_CMD=$(grep "sudo" /tmp/pm2_startup.txt | head -1)
if [ ! -z "$STARTUP_CMD" ]; then
    eval "$STARTUP_CMD" > /dev/null 2>&1 || true
fi

print_success "PM2 configurado"

# ============================================
# Passo 10: Configurar Nginx
# ============================================
print_step "Configurando Nginx..."

NGINX_CONFIG="/etc/nginx/sites-available/$APP_NAME"

cat > "$NGINX_CONFIG" << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Logs
    access_log /var/log/nginx/$APP_NAME-access.log;
    error_log /var/log/nginx/$APP_NAME-error.log;

    # Tamanho máximo de upload
    client_max_body_size 10M;

    # Proxy para Next.js
    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache para assets estáticos
    location /_next/static {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Ativar site
ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/$APP_NAME

# Remover site padrão se existir
rm -f /etc/nginx/sites-enabled/default

# Testar configuração do Nginx
nginx -t > /dev/null 2>&1 || {
    print_error "Erro na configuração do Nginx"
    nginx -t
    exit 1
}

# Recarregar Nginx
systemctl reload nginx > /dev/null 2>&1 || systemctl restart nginx > /dev/null 2>&1

print_success "Nginx configurado"

# ============================================
# Passo 11: Configurar firewall
# ============================================
print_step "Configurando firewall..."
ufw allow 22/tcp > /dev/null 2>&1 || true  # SSH
ufw allow 80/tcp > /dev/null 2>&1 || true  # HTTP
ufw allow 443/tcp > /dev/null 2>&1 || true # HTTPS
ufw --force enable > /dev/null 2>&1 || true
print_success "Firewall configurado"

# ============================================
# Passo 12: Verificar se está funcionando
# ============================================
print_step "Verificando serviço..."
sleep 3

if pm2 list | grep -q "$APP_NAME.*online"; then
    print_success "Serviço está rodando!"
else
    print_error "Serviço não está rodando. Verificando logs..."
    pm2 logs "$APP_NAME" --lines 10 --nostream
fi

# Testar aplicação
print_step "Testando aplicação..."
sleep 2
if curl -s http://localhost:$PORT > /dev/null 2>&1 || curl -s http://127.0.0.1:$PORT > /dev/null 2>&1; then
    print_success "Aplicação está respondendo!"
else
    print_info "Aplicação ainda não está respondendo. Pode levar alguns segundos..."
    print_info "Verifique os logs: pm2 logs $APP_NAME"
fi

# ============================================
# Resumo final
# ============================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Deploy Concluído!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Informações:${NC}"
echo "  • Diretório: $FINAL_APP_DIR"
echo "  • Serviço: $APP_NAME"
echo "  • Porta: $PORT"
echo "  • Domínio: $DOMAIN"
echo "  • Nginx: http://$DOMAIN"
echo ""
echo -e "${BLUE}Próximos passos:${NC}"
echo "  1. Edite o arquivo .env.local com suas configurações:"
echo "     nano $FINAL_APP_DIR/.env.local"
echo ""
echo "  2. Configure o domínio no Nginx (se necessário):"
echo "     nano $NGINX_CONFIG"
echo "     nginx -t && systemctl reload nginx"
echo ""
echo "  3. Configure SSL com Let's Encrypt (opcional):"
echo "     sudo apt install certbot python3-certbot-nginx"
echo "     sudo certbot --nginx -d $DOMAIN"
echo ""
echo -e "${BLUE}Comandos úteis:${NC}"
echo "  • Ver status: pm2 status"
echo "  • Ver logs: pm2 logs $APP_NAME"
echo "  • Reiniciar: pm2 restart $APP_NAME"
echo "  • Parar: pm2 stop $APP_NAME"
echo "  • Ver logs Nginx: tail -f /var/log/nginx/$APP_NAME-error.log"
echo "  • Testar: curl http://localhost:$PORT"
echo ""
echo -e "${GREEN}Pronto! O serviço está rodando.${NC}"
echo ""


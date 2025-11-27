# Guia de Deploy - Next.js Ponto

Este guia explica como fazer o deploy da aplicação Next.js em um servidor Ubuntu 24.04.

## 🚀 Deploy Completamente Automatizado (RECOMENDADO)

**Para um deploy 100% automatizado sem nenhuma configuração manual:**

```bash
# Clonar o repositório
git clone https://github.com/JorgeWendell/ponto.git
cd ponto

# Tornar executável e executar
chmod +x deploy_auto.sh
sudo ./deploy_auto.sh
```

**O script `deploy_auto.sh` faz TUDO automaticamente:**

- ✅ Atualiza o sistema
- ✅ Instala Node.js 20.x e PM2
- ✅ Instala dependências do sistema (Nginx, etc.)
- ✅ Clona/atualiza o repositório
- ✅ Instala dependências Node.js
- ✅ **Cria arquivo .env.local com valores padrão**
- ✅ Faz build da aplicação
- ✅ Configura PM2
- ✅ **Configura Nginx como reverse proxy**
- ✅ Configura firewall
- ✅ Verifica se está funcionando

**Você só precisa editar o `.env` após o deploy!**

## ⚙️ Configuração do .env.local

Após o deploy, edite o arquivo `.env`:

```bash
nano /var/www/ponto/.env
```

Configure as seguintes variáveis:

```env
# Database PostgreSQL

NODE_ENV=production
DATABASE_URL="postgresql://postgres:adel1234@192.168.15.47:5432/ponto"

NEXTCLOUD_WEBDAV_URL=http://192.168.15.10/remote.php/dav/files/Ponto
NEXTCLOUD_USER=ponto
NEXTCLOUD_PASSWORD=Lucas@120908


FACE_RECOGNITION_API_URL=http://192.168.15.56:9000
BETTER_AUTH_SECRET="Adel@1234"

BETTER_AUTH_URL=http://ponto.adelbr.tech:9099




# Node Environment

```

**Após editar, reinicie o serviço:**

```bash
pm2 restart ponto
```

## 🌐 Configuração de Domínio

### Opção 1: Usar IP (Desenvolvimento/Teste)

O script já configura para `localhost` por padrão. Para usar um IP específico:

```bash
DOMAIN=192.168.15.57 sudo ./deploy_auto.sh
```

### Opção 2: Usar Domínio (Produção)

1. Configure o DNS para apontar seu domínio para o IP do servidor
2. Execute o deploy com o domínio:

   ```bash
   DOMAIN=ponto.adelbr.tech:9099 sudo ./deploy_auto.sh
   ```

3. Configure SSL com Let's Encrypt:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d seu-dominio.com
   ```

## 📋 Pré-requisitos

- Ubuntu 24.04 LTS
- Acesso root ou sudo
- PostgreSQL instalado e configurado
- Git instalado (o script instala automaticamente)

## 🔧 Comandos Úteis

### PM2

```bash
pm2 status              # Ver status
pm2 logs ponto          # Ver logs
pm2 restart ponto       # Reiniciar
pm2 stop ponto          # Parar
pm2 delete ponto        # Remover
```

### Nginx

```bash
sudo nginx -t           # Testar configuração
sudo systemctl reload nginx  # Recarregar
sudo systemctl restart nginx  # Reiniciar
sudo tail -f /var/log/nginx/ponto-error.log  # Ver logs de erro
```

### Atualizar Aplicação

```bash
cd /var/www/ponto
git pull origin main
npm install
npm run build
pm2 restart ponto
```

## 🔄 Atualizações Rápidas

Para atualizar apenas o código após fazer push no GitHub:

```bash
cd /var/www/ponto
git pull origin main
npm install
npm run build
pm2 restart ponto
```

Ou use o script de deploy do package.json:

```bash
cd /var/www/ponto
npm run deploy
```

## 🐛 Troubleshooting

### Serviço não está respondendo

```bash
# Verificar status do PM2
pm2 status

# Ver logs
pm2 logs ponto --lines 50

# Verificar se a porta está em uso
sudo lsof -i :3000
```

### Erro no build

```bash
# Ver logs do build
cat /tmp/ponto_build.log

# Limpar cache e tentar novamente
cd /var/www/ponto
rm -rf .next node_modules
npm install
npm run build
```

### Erro no Nginx

```bash
# Testar configuração
sudo nginx -t

# Ver logs
sudo tail -f /var/log/nginx/ponto-error.log
```

### Problemas de permissão

```bash
sudo chown -R $USER:$USER /var/www/ponto
```

## 📝 Estrutura de Arquivos

```
/var/www/ponto/
├── .env.local          # Variáveis de ambiente (editar após deploy)
├── ecosystem.config.js  # Configuração do PM2
├── package.json
├── next.config.ts
└── ...
```

## 🔐 Segurança

1. **Sempre use HTTPS em produção** (Let's Encrypt)
2. **Mude o BETTER_AUTH_SECRET** para uma chave aleatória forte
3. **Configure firewall** adequadamente
4. **Mantenha o sistema atualizado**: `sudo apt update && sudo apt upgrade`

## 📞 Suporte

Em caso de problemas, verifique:

1. Logs do PM2: `pm2 logs ponto`
2. Logs do Nginx: `/var/log/nginx/ponto-error.log`
3. Status do serviço: `pm2 status`
4. Configuração do Nginx: `/etc/nginx/sites-available/ponto`

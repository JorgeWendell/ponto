const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const certDir = path.join(__dirname, '..', '.cert');
const keyPath = path.join(certDir, 'key.pem');
const certPath = path.join(certDir, 'cert.pem');

// Criar diretório se não existir
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

// Verificar se os certificados já existem
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  console.log('Certificados SSL já existem.');
  process.exit(0);
}

console.log('Gerando certificados SSL autoassinados...');
console.log('Isso pode levar alguns segundos...');

try {
  // Gerar certificado autoassinado válido para 192.168.15.12 e localhost
  // Usando -addext para OpenSSL 1.1.1+ ou -extensions para versões mais antigas
  const opensslVersion = execSync('openssl version', { encoding: 'utf-8' });
  console.log('OpenSSL version:', opensslVersion.trim());
  
  let command = '';
  if (opensslVersion.includes('OpenSSL 1.1.1') || opensslVersion.includes('OpenSSL 3.')) {
    // OpenSSL 1.1.1+ ou 3.x
    command = `openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/C=BR/ST=SP/L=SaoPaulo/O=Dev/CN=192.168.15.12" -addext "subjectAltName=DNS:localhost,DNS:192.168.15.12,IP:127.0.0.1,IP:192.168.15.12"`;
  } else {
    // Versões mais antigas - criar arquivo de configuração
    const configPath = path.join(certDir, 'openssl.conf');
    const configContent = `[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
C = BR
ST = SP
L = SaoPaulo
O = Dev
CN = 192.168.15.12

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = 192.168.15.12
IP.1 = 127.0.0.1
IP.2 = 192.168.15.12
`;
    fs.writeFileSync(configPath, configContent);
    command = `openssl req -x509 -newkey rsa:4096 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -config "${configPath}" -extensions v3_req`;
  }
  
  execSync(command, { stdio: 'inherit' });
  console.log('✅ Certificados SSL gerados com sucesso!');
  console.log(`   Key: ${keyPath}`);
  console.log(`   Cert: ${certPath}`);
} catch (error) {
  console.error('❌ Erro ao gerar certificados.');
  console.error('Certifique-se de que o OpenSSL está instalado e no PATH.');
  console.error('Windows: Baixe de https://slproweb.com/products/Win32OpenSSL.html');
  console.error('Ou use: npm run dev:http para HTTP normal');
  process.exit(1);
}


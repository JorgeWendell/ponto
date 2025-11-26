const selfsigned = require('selfsigned');
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
  console.log('✅ Certificados SSL já existem.');
  console.log(`   Key: ${keyPath}`);
  console.log(`   Cert: ${certPath}`);
  process.exit(0);
}

console.log('🔐 Gerando certificados SSL autoassinados com Node.js...');
console.log('   Isso pode levar alguns segundos...\n');

try {
  // Gerar certificado autoassinado válido para 192.168.15.12 e localhost
  const attrs = [
    { name: 'countryName', value: 'BR' },
    { name: 'stateOrProvinceName', value: 'SP' },
    { name: 'localityName', value: 'SaoPaulo' },
    { name: 'organizationName', value: 'Dev' },
    { name: 'commonName', value: '192.168.15.12' },
  ];

  const pems = selfsigned.generate(attrs, {
    keySize: 4096,
    days: 365,
    algorithm: 'sha256',
    extensions: [
      {
        name: 'basicConstraints',
        cA: true,
      },
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true,
      },
      {
        name: 'subjectAltName',
        altNames: [
          {
            type: 2, // DNS
            value: 'localhost',
          },
          {
            type: 2, // DNS
            value: '192.168.15.12',
          },
          {
            type: 7, // IP
            ip: '127.0.0.1',
          },
          {
            type: 7, // IP
            ip: '192.168.15.12',
          },
        ],
      },
    ],
  });

  // Salvar certificados
  fs.writeFileSync(keyPath, pems.private);
  fs.writeFileSync(certPath, pems.cert);

  console.log('✅ Certificados SSL gerados com sucesso!');
  console.log(`   Key: ${keyPath}`);
  console.log(`   Cert: ${certPath}`);
  console.log('');
  console.log('📋 Válido para:');
  console.log('   - localhost');
  console.log('   - 192.168.15.12');
  console.log('   - 127.0.0.1');
  console.log('');
} catch (error) {
  console.error('❌ Erro ao gerar certificados:', error.message);
  process.exit(1);
}


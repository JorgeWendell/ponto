const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = 3000;

const certDir = path.join(__dirname, '..', '.cert');
const keyPath = path.join(certDir, 'key.pem');
const certPath = path.join(certDir, 'cert.pem');

// Verificar se os certificados existem
if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.error('❌ Certificados SSL não encontrados!');
  console.error('Execute: npm run generate-cert');
  console.error('Ou use: npm run dev:http para HTTP normal');
  process.exit(1);
}

const key = fs.readFileSync(keyPath);
const cert = fs.readFileSync(certPath);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let server = null;

app.prepare().then(() => {
  server = createServer({ key, cert }, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  server.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log('');
    console.log('✅ Servidor HTTPS iniciado!');
    console.log(`   Local:    https://localhost:${port}`);
    console.log(`   Rede:     https://192.168.15.12:${port}`);
    console.log('');
    console.log('⚠️  Certificado autoassinado - aceite o aviso de segurança no navegador');
    console.log('');
  });
});

process.on('SIGTERM', () => {
  if (server) {
    server.close();
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  if (server) {
    server.close();
  }
  process.exit(0);
});

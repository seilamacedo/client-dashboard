const express = require('express');
const cors = require('cors');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));
app.use(express.json());

// Configuração do R2 (Cloudflare)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: 'https://cc74d1c79a5c19887e46e17c0be81267.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: 'da93734171ca828790728ac023417b23',
    secretAccessKey: '870cfa1f981accb58d16db2e31f52b68594751da45d6bce574c26af81ae7a345'
  }
});

const BUCKET_NAME = 'midias-bdm';

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Gerar presigned URL para upload
app.post('/api/upload-url', async (req, res) => {
  try {
    const { filename, contentType } = req.body;
    
    if (!filename || !contentType) {
      return res.status(400).json({ error: 'Filename e contentType são obrigatórios' });
    }

    // Gerar nome único para o arquivo
    const fileExtension = path.extname(filename);
    const uniqueFilename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${fileExtension}`;
    
    // Criar comando para upload
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFilename,
      ContentType: contentType,
    });

    // Gerar presigned URL (válida por 15 minutos)
    const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 900 });
    
    // URL pública do arquivo após upload (usando proxy do backend)
    const publicUrl = `http://localhost:3000/api/media/${uniqueFilename}`;

    res.json({
      uploadUrl: presignedUrl,
      publicUrl: publicUrl,
      filename: uniqueFilename
    });

  } catch (error) {
    console.error('Erro ao gerar presigned URL:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint OPTIONS para CORS preflight
app.options('/api/media/:filename', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).end();
});

// Proxy para servir mídia do R2 (solução para CORS)
app.get('/api/media/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Criar comando para obter objeto
    const { GetObjectCommand } = require('@aws-sdk/client-s3');
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
    });

    // Fazer download da imagem do R2
    const response = await r2Client.send(command);
    
    // Configurar headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Configurar headers da imagem
    res.setHeader('Content-Type', response.ContentType || 'application/octet-stream');
    res.setHeader('Content-Length', response.ContentLength);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache por 1 hora
    
    // Enviar a imagem como stream
    response.Body.pipe(res);

  } catch (error) {
    console.error('Erro ao servir mídia:', error);
    res.status(404).json({ error: 'Arquivo não encontrado' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📤 Upload endpoint: http://localhost:${PORT}/api/upload-url`);
});

module.exports = app; 
const admin = require('firebase-admin');
require('dotenv').config();

// Inicializar Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Dados iniciais para as coleções
const initialData = {
  usuarios: [
    {
      id: 'admin-1',
      nome: 'Admin Sistema',
      email: 'admin@barbeariadamooca.com',
      tipo: 'admin',
      ultimoAcesso: new Date(),
      dataCriacao: new Date('2024-01-15T09:00:00Z'),
      ativo: true
    },
    {
      id: 'editor-1',
      nome: 'Editor Posts',
      email: 'editor@barbeariadamooca.com',
      tipo: 'editor',
      ultimoAcesso: new Date(),
      dataCriacao: new Date('2024-03-10T14:00:00Z'),
      ativo: true
    }
  ],
  clientes: [
    {
      id: 'cliente-1',
      nome: 'João Silva',
      email: 'joao@email.com',
      telefone: '(11) 99999-9999',
              logo: 'https://ui-avatars.com/api/?name=João Silva&background=FF4444&color=FFFFFF&size=50',
      dataCriacao: new Date('2024-01-20T10:00:00Z'),
      postsAtivos: 5,
      ativo: true
    },
    {
      id: 'cliente-2',
      nome: 'Maria Santos',
      email: 'maria@email.com',
      telefone: '(11) 88888-8888',
              logo: 'https://ui-avatars.com/api/?name=Maria Santos&background=FF4444&color=FFFFFF&size=50',
      dataCriacao: new Date('2024-02-15T11:00:00Z'),
      postsAtivos: 8,
      ativo: true
    },
    {
      id: 'cliente-3',
      nome: 'Pedro Oliveira',
      email: 'pedro@email.com',
      telefone: '(11) 77777-7777',
              logo: 'https://ui-avatars.com/api/?name=Pedro Oliveira&background=FF4444&color=FFFFFF&size=50',
      dataCriacao: new Date('2024-03-01T15:00:00Z'),
      postsAtivos: 3,
      ativo: true
    },
    {
      id: 'cliente-4',
      nome: 'Carlos Barbosa',
      email: 'carlos@email.com',
      telefone: '(11) 66666-6666',
              logo: 'https://ui-avatars.com/api/?name=Carlos Barbosa&background=FF4444&color=FFFFFF&size=50',
      dataCriacao: new Date('2024-03-15T14:00:00Z'),
      postsAtivos: 2,
      ativo: true
    },
    {
      id: 'cliente-5',
      nome: 'Ana Costa',
      email: 'ana@email.com',
      telefone: '(11) 55555-5555',
              logo: 'https://ui-avatars.com/api/?name=Ana Costa&background=FF4444&color=FFFFFF&size=50',
      dataCriacao: new Date('2024-04-01T09:00:00Z'),
      postsAtivos: 6,
      ativo: true
    }
  ],
  posts: [
    {
      id: 'post-1',
      clienteId: 'cliente-1',
      clienteNome: 'João Silva',
      tipo: 'imagem',
              midia: 'https://picsum.photos/300/400?random=1',
      legenda: 'Novo corte masculino, estilo moderno e elegante #barbearia #corte',
      status: 'pendente',
      dataAgendamento: new Date('2025-07-05T09:00:00Z'),
      dataCriacao: new Date('2025-07-04T10:00:00Z'),
      day: 5,
      month: 6,
      year: 2025
    },
    {
      id: 'post-2',
      clienteId: 'cliente-2',
      clienteNome: 'Maria Santos',
      tipo: 'video',
              midia: 'https://picsum.photos/300/400?random=2',
      legenda: 'Transformação completa, antes e depois do corte #transformacao',
      status: 'aprovado',
      dataAgendamento: new Date('2025-07-06T14:00:00Z'),
      dataCriacao: new Date('2025-07-03T16:00:00Z'),
      day: 6,
      month: 6,
      year: 2025
    }
  ],
  configuracoes: {
    sistema: {
      nomeEmpresa: 'Barbearia da Mooca',
      logoUrl: 'https://static.tumblr.com/n23hsjy/Iaqstfovt/logo_bdm.png',
      corPrimaria: '#FF4444',
      tema: 'escuro'
    },
    notificacoes: {
      email: true,
      push: true,
      novoPosts: true,
      aprovacoes: true
    },
    backup: {
      automatico: true,
      frequencia: 'diaria',
      horario: '02:00'
    }
  }
};

async function setupFirestore() {
  try {
    console.log('🚀 Iniciando configuração do Firestore...');

    // Criar usuários
    console.log('📝 Criando usuários...');
    for (const usuario of initialData.usuarios) {
      await db.collection('usuarios').doc(usuario.id).set(usuario);
    }

    // Criar clientes
    console.log('👥 Criando clientes...');
    for (const cliente of initialData.clientes) {
      await db.collection('clientes').doc(cliente.id).set(cliente);
    }

    // Criar posts
    console.log('📝 Criando posts...');
    for (const post of initialData.posts) {
      await db.collection('posts').doc(post.id).set(post);
    }

    // Criar configurações
    console.log('⚙️ Criando configurações...');
    await db.collection('configuracoes').doc('sistema').set(initialData.configuracoes);

    console.log('✅ Configuração do Firestore concluída com sucesso!');
    console.log('📊 Dados criados:');
    console.log(`   - ${initialData.usuarios.length} usuários`);
    console.log(`   - ${initialData.clientes.length} clientes`);
    console.log(`   - ${initialData.posts.length} posts`);
    console.log('   - 1 configuração do sistema');

  } catch (error) {
    console.error('❌ Erro ao configurar Firestore:', error);
  } finally {
    process.exit(0);
  }
}

setupFirestore(); 
/**
 * Servidor WebSocket propio para sincronización Yjs
 * 
 * Este servidor es opcional - puedes usar el servidor público de demos
 * de Yjs para desarrollo, pero para producción es mejor tener tu propio
 * servidor.
 * 
 * Uso:
 *   node server/websocket-server.js
 * 
 * El servidor escuchará en el puerto 1234 por defecto
 */

import { WebSocketServer } from 'ws';
import http from 'http';
import * as Y from 'yjs';
import { setupWSConnection, docs } from 'y-websocket/bin/utils';

const PORT = process.env.PORT || 1234;

// Crear servidor HTTP
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Yjs WebSocket Server - Organigrama Colaborativo\n');
});

// Crear servidor WebSocket
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
    console.log('🔌 Nueva conexión WebSocket');
    
    // Configurar la conexión Yjs
    setupWSConnection(ws, req);
    
    ws.on('close', () => {
        console.log('👋 Conexión cerrada');
    });
});

// Estadísticas periódicas
setInterval(() => {
    const rooms = Array.from(docs.keys());
    const totalConnections = wss.clients.size;
    
    console.log(`📊 Estadísticas:`);
    console.log(`   - Salas activas: ${rooms.length}`);
    console.log(`   - Conexiones totales: ${totalConnections}`);
    
    rooms.forEach(room => {
        const doc = docs.get(room);
        if (doc) {
            console.log(`   - Sala "${room}": ${doc.conns?.size || 0} usuarios`);
        }
    });
}, 30000);

// Iniciar servidor
server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 Servidor WebSocket Yjs iniciado                       ║
║                                                            ║
║   URL: ws://localhost:${PORT}                                ║
║                                                            ║
║   Para conectar desde el frontend, actualiza:              ║
║   collaborative-store.js -> WEBSOCKET_URL                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
});

// Manejo de errores
server.on('error', (err) => {
    console.error('❌ Error del servidor:', err);
});

process.on('SIGINT', () => {
    console.log('\n👋 Cerrando servidor...');
    wss.close();
    server.close();
    process.exit(0);
});

/**
 * Collaborative Store usando Yjs
 * 
 * Este módulo maneja la sincronización en tiempo real de los datos
 * del organigrama entre múltiples usuarios usando CRDTs.
 * 
 * Características:
 * - Sincronización en tiempo real via WebSocket
 * - Persistencia local con IndexedDB (funciona offline)
 * - Resolución automática de conflictos (CRDT)
 * - Awareness (ver qué usuarios están conectados)
 */

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';

// Servidor WebSocket público de Yjs para demos
// En producción, usar tu propio servidor
const WEBSOCKET_URL = 'wss://demos.yjs.dev';

export class CollaborativeStore {
    constructor(roomName) {
        this.roomName = roomName;
        this.doc = new Y.Doc();
        this.nodes = this.doc.getMap('nodes');
        
        this.wsProvider = null;
        this.indexeddbProvider = null;
        
        this.dataChangeCallbacks = [];
        this.connectionChangeCallbacks = [];
        
        // Usuario actual (genera un ID y color aleatorio)
        this.currentUser = {
            id: this.generateUserId(),
            name: this.generateUserName(),
            color: this.generateUserColor()
        };
        
        this._setupObservers();
    }
    
    /**
     * Genera un ID único para el usuario
     */
    generateUserId() {
        return Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Genera un nombre de usuario aleatorio
     */
    generateUserName() {
        const adjectives = ['Veloz', 'Ágil', 'Brillante', 'Creativo', 'Dinámico'];
        const nouns = ['Puma', 'Águila', 'Delfín', 'León', 'Búho'];
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        return `${adj} ${noun}`;
    }
    
    /**
     * Genera un color aleatorio para el usuario
     */
    generateUserColor() {
        const colors = [
            '#ef4444', '#f97316', '#eab308', '#22c55e', 
            '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    /**
     * Conecta al servidor y sincroniza datos
     */
    async connect() {
        console.log('🔌 Conectando a la sala:', this.roomName);
        
        // Persistencia local con IndexedDB
        this.indexeddbProvider = new IndexeddbPersistence(this.roomName, this.doc);
        
        await this.indexeddbProvider.whenSynced;
        console.log('💾 Datos locales sincronizados');
        
        // Conexión WebSocket para sincronización en tiempo real
        this.wsProvider = new WebsocketProvider(
            WEBSOCKET_URL,
            this.roomName,
            this.doc
        );
        
        // Configurar awareness (información del usuario)
        this.wsProvider.awareness.setLocalState({
            user: this.currentUser
        });
        
        // Escuchar cambios de conexión
        this.wsProvider.on('status', ({ status }) => {
            console.log('📡 Estado de conexión:', status);
            this._notifyConnectionChange(status === 'connected');
        });
        
        // Escuchar cambios en awareness
        this.wsProvider.awareness.on('change', () => {
            this._notifyConnectionChange(this.wsProvider.wsconnected);
        });
        
        return this;
    }
    
    /**
     * Desconecta del servidor
     */
    disconnect() {
        if (this.wsProvider) {
            this.wsProvider.disconnect();
        }
        if (this.indexeddbProvider) {
            this.indexeddbProvider.destroy();
        }
    }
    
    /**
     * Configura los observadores de cambios
     */
    _setupObservers() {
        this.nodes.observe(() => {
            this._notifyDataChange();
        });
    }
    
    /**
     * Notifica a los callbacks de cambio de datos
     */
    _notifyDataChange() {
        const data = this.getData();
        this.dataChangeCallbacks.forEach(cb => cb(data));
    }
    
    /**
     * Notifica a los callbacks de cambio de conexión
     */
    _notifyConnectionChange(connected) {
        const userCount = this.getConnectedUsers().length;
        this.connectionChangeCallbacks.forEach(cb => cb(connected, userCount));
    }
    
    /**
     * Registra un callback para cambios en los datos
     */
    onDataChange(callback) {
        this.dataChangeCallbacks.push(callback);
    }
    
    /**
     * Registra un callback para cambios de conexión
     */
    onConnectionChange(callback) {
        this.connectionChangeCallbacks.push(callback);
    }
    
    /**
     * Obtiene todos los nodos como array
     */
    getData() {
        const data = [];
        this.nodes.forEach((value, key) => {
            data.push({ id: key, ...value });
        });
        return data;
    }
    
    /**
     * Obtiene un nodo por ID
     */
    getNode(id) {
        const node = this.nodes.get(id);
        return node ? { id, ...node } : null;
    }
    
    /**
     * Agrega un nuevo nodo
     */
    addNode(node) {
        const { id, ...data } = node;
        
        // Usar transacción para agrupar cambios
        this.doc.transact(() => {
            this.nodes.set(id, data);
        }, this.currentUser.id);
        
        console.log('➕ Nodo agregado:', id);
        return id;
    }
    
    /**
     * Actualiza un nodo existente
     */
    updateNode(id, updates) {
        const current = this.nodes.get(id);
        if (!current) {
            console.warn('Nodo no encontrado:', id);
            return false;
        }
        
        this.doc.transact(() => {
            this.nodes.set(id, { ...current, ...updates });
        }, this.currentUser.id);
        
        console.log('📝 Nodo actualizado:', id);
        return true;
    }
    
    /**
     * Elimina un nodo
     */
    removeNode(id) {
        if (!this.nodes.has(id)) {
            console.warn('Nodo no encontrado:', id);
            return false;
        }
        
        this.doc.transact(() => {
            this.nodes.delete(id);
        }, this.currentUser.id);
        
        console.log('🗑️ Nodo eliminado:', id);
        return true;
    }
    
    /**
     * Obtiene los usuarios conectados
     */
    getConnectedUsers() {
        if (!this.wsProvider) return [this.currentUser];
        
        const users = [];
        this.wsProvider.awareness.getStates().forEach((state) => {
            if (state.user) {
                users.push(state.user);
            }
        });
        
        return users;
    }
    
    /**
     * Importa datos desde un array
     */
    importData(dataArray) {
        this.doc.transact(() => {
            // Limpiar datos existentes
            this.nodes.forEach((_, key) => {
                this.nodes.delete(key);
            });
            
            // Importar nuevos datos
            dataArray.forEach(node => {
                const { id, ...data } = node;
                this.nodes.set(id, data);
            });
        }, this.currentUser.id);
        
        console.log('📥 Datos importados:', dataArray.length, 'nodos');
    }
    
    /**
     * Exporta datos como JSON
     */
    exportData() {
        return JSON.stringify(this.getData(), null, 2);
    }
    
    /**
     * Limpia todos los datos
     */
    clear() {
        this.doc.transact(() => {
            this.nodes.forEach((_, key) => {
                this.nodes.delete(key);
            });
        }, this.currentUser.id);
        
        console.log('🧹 Datos limpiados');
    }
}

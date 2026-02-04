/**
 * Collaborative Store usando Yjs
 * 
 * Este módulo maneja la sincronización en tiempo real de los datos
 * del organigrama entre múltiples usuarios usando CRDTs.
 */

import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'
import type { OrgNode, ConnectedUser } from '@/types/organigrama'

// Servidor WebSocket público de Yjs para demos
// En producción, usar tu propio servidor
const WEBSOCKET_URL = 'wss://demos.yjs.dev'

type DataChangeCallback = (data: OrgNode[]) => void
type ConnectionChangeCallback = (connected: boolean, userCount: number) => void

export class CollaborativeStore {
  private roomName: string
  private doc: Y.Doc
  private nodes: Y.Map<Omit<OrgNode, 'id'>>
  private wsProvider: WebsocketProvider | null = null
  private indexeddbProvider: IndexeddbPersistence | null = null
  private dataChangeCallbacks: DataChangeCallback[] = []
  private connectionChangeCallbacks: ConnectionChangeCallback[] = []
  currentUser: ConnectedUser

  constructor(roomName: string) {
    this.roomName = roomName
    this.doc = new Y.Doc()
    this.nodes = this.doc.getMap('nodes')
    
    this.currentUser = {
      id: this.generateUserId(),
      name: this.generateUserName(),
      color: this.generateUserColor()
    }
    
    this._setupObservers()
  }

  private generateUserId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private generateUserName(): string {
    const adjectives = ['Veloz', 'Ágil', 'Brillante', 'Creativo', 'Dinámico']
    const nouns = ['Puma', 'Águila', 'Delfín', 'León', 'Búho']
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    return `${adj} ${noun}`
  }

  private generateUserColor(): string {
    const colors = [
      '#ef4444', '#f97316', '#eab308', '#22c55e',
      '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  async connect(): Promise<this> {
    console.log('🔌 Conectando a la sala:', this.roomName)

    // Persistencia local con IndexedDB
    this.indexeddbProvider = new IndexeddbPersistence(this.roomName, this.doc)
    await this.indexeddbProvider.whenSynced
    console.log('💾 Datos locales sincronizados')

    // Conexión WebSocket para sincronización en tiempo real
    this.wsProvider = new WebsocketProvider(
      WEBSOCKET_URL,
      this.roomName,
      this.doc,
      { connect: true }
    )

    // Configurar awareness
    this.wsProvider.awareness.setLocalState({
      user: this.currentUser
    })

    // Timeout para marcar como "conectado" después de 3s aunque no haya respuesta del servidor
    // Esto permite trabajar offline con los datos locales
    const connectionTimeout = setTimeout(() => {
      if (!this.wsProvider?.wsconnected) {
        console.log('⚠️ Servidor WebSocket no responde, trabajando offline')
        // Notificar como conectado para no bloquear la UI
        this._notifyConnectionChange(true)
      }
    }, 3000)

    // Escuchar cambios de conexión
    this.wsProvider.on('status', ({ status }: { status: string }) => {
      console.log('📡 Estado de conexión:', status)
      if (status === 'connected') {
        clearTimeout(connectionTimeout)
      }
      this._notifyConnectionChange(status === 'connected')
    })

    // Escuchar cambios en awareness
    this.wsProvider.awareness.on('change', () => {
      this._notifyConnectionChange(this.wsProvider?.wsconnected ?? true)
    })

    return this
  }

  disconnect(): void {
    this.wsProvider?.disconnect()
    this.indexeddbProvider?.destroy()
  }

  private _setupObservers(): void {
    this.nodes.observe(() => {
      this._notifyDataChange()
    })
  }

  private _notifyDataChange(): void {
    const data = this.getData()
    this.dataChangeCallbacks.forEach(cb => cb(data))
  }

  private _notifyConnectionChange(connected: boolean): void {
    const userCount = this.getConnectedUsers().length
    this.connectionChangeCallbacks.forEach(cb => cb(connected, userCount))
  }

  onDataChange(callback: DataChangeCallback): void {
    this.dataChangeCallbacks.push(callback)
  }

  onConnectionChange(callback: ConnectionChangeCallback): void {
    this.connectionChangeCallbacks.push(callback)
  }

  getData(): OrgNode[] {
    const data: OrgNode[] = []
    this.nodes.forEach((value, key) => {
      data.push({ id: key, ...value } as OrgNode)
    })
    return data
  }

  getNode(id: string): OrgNode | null {
    const node = this.nodes.get(id)
    return node ? { id, ...node } as OrgNode : null
  }

  addNode(node: OrgNode): string {
    const { id, ...data } = node
    
    this.doc.transact(() => {
      this.nodes.set(id, data)
    }, this.currentUser.id)
    
    console.log('➕ Nodo agregado:', id)
    return id
  }

  updateNode(id: string, updates: Partial<OrgNode>): boolean {
    const current = this.nodes.get(id)
    if (!current) {
      console.warn('Nodo no encontrado:', id)
      return false
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...updateData } = updates

    this.doc.transact(() => {
      this.nodes.set(id, { ...current, ...updateData })
    }, this.currentUser.id)

    console.log('📝 Nodo actualizado:', id)
    return true
  }

  removeNode(id: string): boolean {
    if (!this.nodes.has(id)) {
      console.warn('Nodo no encontrado:', id)
      return false
    }

    this.doc.transact(() => {
      this.nodes.delete(id)
    }, this.currentUser.id)

    console.log('🗑️ Nodo eliminado:', id)
    return true
  }

  getConnectedUsers(): ConnectedUser[] {
    if (!this.wsProvider) return [this.currentUser]

    const users: ConnectedUser[] = []
    this.wsProvider.awareness.getStates().forEach((state) => {
      if (state.user) {
        users.push(state.user as ConnectedUser)
      }
    })

    return users
  }

  importData(dataArray: OrgNode[]): void {
    this.doc.transact(() => {
      // Limpiar datos existentes
      this.nodes.forEach((_, key) => {
        this.nodes.delete(key)
      })

      // Importar nuevos datos
      dataArray.forEach(node => {
        const { id, ...data } = node
        this.nodes.set(id, data)
      })
    }, this.currentUser.id)

    console.log('📥 Datos importados:', dataArray.length, 'nodos')
  }

  clear(): void {
    this.doc.transact(() => {
      this.nodes.forEach((_, key) => {
        this.nodes.delete(key)
      })
    }, this.currentUser.id)

    console.log('🧹 Datos limpiados')
  }
}

// Singleton instance
let storeInstance: CollaborativeStore | null = null

export function getCollaborativeStore(roomName: string = 'organigrama-demo'): CollaborativeStore {
  if (!storeInstance) {
    storeInstance = new CollaborativeStore(roomName)
  }
  return storeInstance
}

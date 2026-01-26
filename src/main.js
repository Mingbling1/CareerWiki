/**
 * Organigrama Colaborativo - Main Application
 * 
 * Stack utilizado:
 * - d3-org-chart: Visualización del organigrama
 * - Yjs: CRDT para colaboración en tiempo real
 * - y-websocket: Sincronización via WebSocket
 * - y-indexeddb: Persistencia local offline
 */

import * as d3 from 'd3';
import { OrgChart } from 'd3-org-chart';
import { CollaborativeStore } from './collaborative-store.js';
import { generateId, formatCurrency, debounce } from './utils.js';

// Estado de la aplicación
let chart = null;
let collaborativeStore = null;
let selectedNodeId = null;

// Datos iniciales de ejemplo
const initialData = [
    {
        id: 'ceo-1',
        parentId: null,
        name: 'Carlos Rodríguez',
        position: 'CEO',
        department: 'Dirección General',
        salary: 25000,
        email: 'carlos@empresa.com'
    },
    {
        id: 'cfo-1',
        parentId: 'ceo-1',
        name: 'María García',
        position: 'CFO',
        department: 'Finanzas',
        salary: 18000,
        email: 'maria@empresa.com'
    },
    {
        id: 'cto-1',
        parentId: 'ceo-1',
        name: 'Juan Pérez',
        position: 'CTO',
        department: 'Tecnología',
        salary: 18000,
        email: 'juan@empresa.com'
    },
    {
        id: 'coo-1',
        parentId: 'ceo-1',
        name: 'Ana Martínez',
        position: 'COO',
        department: 'Operaciones',
        salary: 17000,
        email: 'ana@empresa.com'
    },
    {
        id: 'dev-1',
        parentId: 'cto-1',
        name: 'Pedro Sánchez',
        position: 'Tech Lead',
        department: 'Desarrollo',
        salary: 12000,
        email: 'pedro@empresa.com'
    },
    {
        id: 'dev-2',
        parentId: 'dev-1',
        name: 'Luis Torres',
        position: 'Senior Developer',
        department: 'Backend',
        salary: 8000,
        email: 'luis@empresa.com'
    },
    {
        id: 'dev-3',
        parentId: 'dev-1',
        name: 'Carmen López',
        position: 'Senior Developer',
        department: 'Frontend',
        salary: 8000,
        email: 'carmen@empresa.com'
    },
    {
        id: 'fin-1',
        parentId: 'cfo-1',
        name: 'Roberto Díaz',
        position: 'Contador General',
        department: 'Contabilidad',
        salary: 7000,
        email: 'roberto@empresa.com'
    }
];

/**
 * Inicializa la aplicación
 */
async function init() {
    console.log('🚀 Iniciando Organigrama Colaborativo...');
    
    // Inicializar el store colaborativo
    collaborativeStore = new CollaborativeStore('organigrama-demo');
    
    // Escuchar cambios en los datos
    collaborativeStore.onDataChange((data) => {
        console.log('📊 Datos actualizados:', data.length, 'empleados');
        updateChart(data);
        updateStats(data);
        updateParentSelects(data);
    });
    
    // Escuchar estado de conexión
    collaborativeStore.onConnectionChange((connected, userCount) => {
        updateConnectionStatus(connected, userCount);
    });
    
    // Conectar al store
    await collaborativeStore.connect();
    
    // Si no hay datos, cargar los iniciales
    const currentData = collaborativeStore.getData();
    if (currentData.length === 0) {
        console.log('📥 Cargando datos iniciales...');
        initialData.forEach(node => collaborativeStore.addNode(node));
    }
    
    // Inicializar el chart
    initChart();
    
    // Configurar event listeners
    setupEventListeners();
    
    console.log('✅ Aplicación iniciada correctamente');
}

/**
 * Inicializa el chart de organigrama
 */
function initChart() {
    const container = document.getElementById('chartContainer');
    
    chart = new OrgChart()
        .container(container)
        .data(collaborativeStore.getData())
        .nodeWidth(() => 250)
        .nodeHeight(() => 120)
        .childrenMargin(() => 50)
        .compactMarginBetween(() => 35)
        .compactMarginPair(() => 30)
        .neighbourMargin(() => 25)
        .siblingsMargin(() => 25)
        .buttonContent(({ node }) => {
            return `<div style="
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: #4f46e5;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            ">${node.children ? '-' : '+'}</div>`;
        })
        .nodeContent((d) => {
            const node = d.data;
            const salary = formatCurrency(node.salary || 0);
            
            return `
                <div class="node-container" data-node-id="${node.id}">
                    <div class="node-name">${node.name || 'Sin nombre'}</div>
                    <div class="node-position">${node.position || 'Sin cargo'}</div>
                    ${node.department ? `<div class="node-department">${node.department}</div>` : ''}
                    <div class="node-salary">${salary}</div>
                </div>
            `;
        })
        .onNodeClick((d) => {
            openNodePanel(d.data);
        })
        .render();
    
    // Ajustar a la pantalla
    setTimeout(() => chart.fit(), 100);
}

/**
 * Actualiza el chart con nuevos datos
 */
function updateChart(data) {
    if (!chart) return;
    
    chart.data(data).render();
    
    // Si hay un nodo seleccionado, actualizar el panel
    if (selectedNodeId) {
        const node = data.find(n => n.id === selectedNodeId);
        if (node) {
            updateNodePanel(node);
        }
    }
}

/**
 * Actualiza las estadísticas
 */
function updateStats(data) {
    const totalEmployees = data.length;
    const totalSalary = data.reduce((sum, node) => sum + (node.salary || 0), 0);
    const avgSalary = totalEmployees > 0 ? totalSalary / totalEmployees : 0;
    
    document.getElementById('totalEmployees').textContent = totalEmployees;
    document.getElementById('totalSalary').textContent = formatCurrency(totalSalary);
    document.getElementById('avgSalary').textContent = formatCurrency(Math.round(avgSalary));
}

/**
 * Actualiza el estado de conexión
 */
function updateConnectionStatus(connected, userCount) {
    const statusEl = document.getElementById('connectionStatus');
    const statusText = statusEl.querySelector('.status-text');
    const userCountEl = document.getElementById('userCount');
    
    statusEl.classList.remove('connected', 'disconnected');
    
    if (connected) {
        statusEl.classList.add('connected');
        statusText.textContent = 'Conectado';
    } else {
        statusEl.classList.add('disconnected');
        statusText.textContent = 'Desconectado';
    }
    
    userCountEl.textContent = userCount;
}

/**
 * Actualiza los selectores de padre
 */
function updateParentSelects(data) {
    const selects = ['nodeParent', 'newNodeParent'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        const currentValue = select.value;
        
        // Limpiar opciones excepto la primera
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Agregar opciones
        data.forEach(node => {
            const option = document.createElement('option');
            option.value = node.id;
            option.textContent = `${node.name} - ${node.position}`;
            select.appendChild(option);
        });
        
        // Restaurar valor
        select.value = currentValue;
    });
}

/**
 * Abre el panel lateral con los detalles del nodo
 */
function openNodePanel(node) {
    selectedNodeId = node.id;
    const panel = document.getElementById('sidePanel');
    
    updateNodePanel(node);
    panel.classList.add('open');
}

/**
 * Actualiza el contenido del panel
 */
function updateNodePanel(node) {
    document.getElementById('nodeId').value = node.id;
    document.getElementById('nodeName').value = node.name || '';
    document.getElementById('nodePosition').value = node.position || '';
    document.getElementById('nodeDepartment').value = node.department || '';
    document.getElementById('nodeSalary').value = node.salary || '';
    document.getElementById('nodeEmail').value = node.email || '';
    document.getElementById('nodeParent').value = node.parentId || '';
}

/**
 * Cierra el panel lateral
 */
function closeNodePanel() {
    selectedNodeId = null;
    document.getElementById('sidePanel').classList.remove('open');
}

/**
 * Abre el modal para agregar empleado
 */
function openAddModal() {
    document.getElementById('addNodeModal').classList.add('open');
    document.getElementById('addNodeForm').reset();
}

/**
 * Cierra el modal
 */
function closeAddModal() {
    document.getElementById('addNodeModal').classList.remove('open');
}

/**
 * Configura los event listeners
 */
function setupEventListeners() {
    // Botones del toolbar
    document.getElementById('btnAddNode').addEventListener('click', openAddModal);
    document.getElementById('btnFitScreen').addEventListener('click', () => chart?.fit());
    document.getElementById('btnExpandAll').addEventListener('click', () => chart?.expandAll());
    document.getElementById('btnCollapseAll').addEventListener('click', () => chart?.collapseAll());
    document.getElementById('btnExport').addEventListener('click', exportChart);
    
    // Búsqueda
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce((e) => {
        const query = e.target.value.toLowerCase();
        if (query) {
            const data = collaborativeStore.getData();
            const found = data.find(n => 
                n.name?.toLowerCase().includes(query) ||
                n.position?.toLowerCase().includes(query)
            );
            if (found && chart) {
                chart.setCentered(found.id).render();
            }
        }
    }, 300));
    
    // Panel lateral
    document.getElementById('btnClosePanel').addEventListener('click', closeNodePanel);
    document.getElementById('nodeForm').addEventListener('submit', handleNodeUpdate);
    document.getElementById('btnDeleteNode').addEventListener('click', handleNodeDelete);
    
    // Modal agregar
    document.getElementById('btnCloseModal').addEventListener('click', closeAddModal);
    document.getElementById('btnCancelAdd').addEventListener('click', closeAddModal);
    document.getElementById('addNodeForm').addEventListener('submit', handleNodeAdd);
    
    // Cerrar modal al hacer clic fuera
    document.getElementById('addNodeModal').addEventListener('click', (e) => {
        if (e.target.id === 'addNodeModal') closeAddModal();
    });
    
    // Teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeNodePanel();
            closeAddModal();
        }
    });
}

/**
 * Maneja la actualización de un nodo
 */
function handleNodeUpdate(e) {
    e.preventDefault();
    
    const nodeId = document.getElementById('nodeId').value;
    const updates = {
        name: document.getElementById('nodeName').value,
        position: document.getElementById('nodePosition').value,
        department: document.getElementById('nodeDepartment').value,
        salary: parseFloat(document.getElementById('nodeSalary').value) || 0,
        email: document.getElementById('nodeEmail').value,
        parentId: document.getElementById('nodeParent').value || null
    };
    
    collaborativeStore.updateNode(nodeId, updates);
    console.log('✅ Nodo actualizado:', nodeId);
}

/**
 * Maneja la eliminación de un nodo
 */
function handleNodeDelete() {
    const nodeId = document.getElementById('nodeId').value;
    
    if (!confirm('¿Estás seguro de eliminar este empleado? Los subordinados serán reasignados a su jefe.')) {
        return;
    }
    
    // Obtener el nodo a eliminar
    const data = collaborativeStore.getData();
    const nodeToDelete = data.find(n => n.id === nodeId);
    
    if (!nodeToDelete) return;
    
    // Reasignar hijos al padre del nodo eliminado
    const children = data.filter(n => n.parentId === nodeId);
    children.forEach(child => {
        collaborativeStore.updateNode(child.id, { parentId: nodeToDelete.parentId });
    });
    
    // Eliminar el nodo
    collaborativeStore.removeNode(nodeId);
    closeNodePanel();
    
    console.log('🗑️ Nodo eliminado:', nodeId);
}

/**
 * Maneja la adición de un nuevo nodo
 */
function handleNodeAdd(e) {
    e.preventDefault();
    
    const newNode = {
        id: generateId(),
        name: document.getElementById('newNodeName').value,
        position: document.getElementById('newNodePosition').value,
        department: document.getElementById('newNodeDepartment').value,
        salary: parseFloat(document.getElementById('newNodeSalary').value) || 0,
        parentId: document.getElementById('newNodeParent').value
    };
    
    collaborativeStore.addNode(newNode);
    closeAddModal();
    
    // Centrar en el nuevo nodo
    setTimeout(() => {
        if (chart) {
            chart.setCentered(newNode.id).render();
        }
    }, 100);
    
    console.log('➕ Nuevo nodo agregado:', newNode.id);
}

/**
 * Exporta el chart como imagen PNG
 */
async function exportChart() {
    if (!chart) return;
    
    try {
        await chart.exportImg({
            full: true,
            scale: 2,
            onLoad: (dataUrl) => {
                const link = document.createElement('a');
                link.download = `organigrama-${new Date().toISOString().split('T')[0]}.png`;
                link.href = dataUrl;
                link.click();
            }
        });
        console.log('📥 Chart exportado');
    } catch (error) {
        console.error('Error exportando:', error);
        alert('Error al exportar el organigrama');
    }
}

// Iniciar la aplicación
init().catch(console.error);

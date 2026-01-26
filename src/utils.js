/**
 * Utilidades para el organigrama
 */

/**
 * Genera un ID único
 */
export function generateId() {
    return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Formatea un número como moneda peruana
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Debounce - retrasa la ejecución hasta que pase un tiempo sin llamadas
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle - limita la frecuencia de ejecución
 */
export function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Calcula estadísticas del organigrama
 */
export function calculateStats(data) {
    if (!data || data.length === 0) {
        return {
            totalEmployees: 0,
            totalSalary: 0,
            avgSalary: 0,
            maxSalary: 0,
            minSalary: 0,
            departments: {}
        };
    }
    
    const totalEmployees = data.length;
    const salaries = data.map(n => n.salary || 0);
    const totalSalary = salaries.reduce((a, b) => a + b, 0);
    const avgSalary = totalSalary / totalEmployees;
    const maxSalary = Math.max(...salaries);
    const minSalary = Math.min(...salaries);
    
    // Agrupar por departamento
    const departments = {};
    data.forEach(node => {
        const dept = node.department || 'Sin departamento';
        if (!departments[dept]) {
            departments[dept] = { count: 0, totalSalary: 0 };
        }
        departments[dept].count++;
        departments[dept].totalSalary += node.salary || 0;
    });
    
    return {
        totalEmployees,
        totalSalary,
        avgSalary,
        maxSalary,
        minSalary,
        departments
    };
}

/**
 * Encuentra el camino desde un nodo hasta la raíz
 */
export function findPathToRoot(data, nodeId) {
    const path = [];
    const nodesMap = new Map(data.map(n => [n.id, n]));
    
    let current = nodesMap.get(nodeId);
    while (current) {
        path.push(current);
        current = current.parentId ? nodesMap.get(current.parentId) : null;
    }
    
    return path;
}

/**
 * Encuentra todos los subordinados de un nodo
 */
export function findSubordinates(data, nodeId) {
    const subordinates = [];
    const queue = [nodeId];
    
    while (queue.length > 0) {
        const currentId = queue.shift();
        const children = data.filter(n => n.parentId === currentId);
        
        children.forEach(child => {
            subordinates.push(child);
            queue.push(child.id);
        });
    }
    
    return subordinates;
}

/**
 * Calcula la profundidad de un nodo en el árbol
 */
export function calculateDepth(data, nodeId) {
    const path = findPathToRoot(data, nodeId);
    return path.length - 1;
}

/**
 * Valida si mover un nodo a un nuevo padre crearía un ciclo
 */
export function wouldCreateCycle(data, nodeId, newParentId) {
    if (!newParentId) return false;
    
    // Obtener todos los subordinados del nodo
    const subordinates = findSubordinates(data, nodeId);
    const subordinateIds = new Set(subordinates.map(s => s.id));
    
    // Si el nuevo padre está entre los subordinados, se crearía un ciclo
    return subordinateIds.has(newParentId);
}

/**
 * Convierte datos planos a estructura jerárquica
 */
export function buildHierarchy(data) {
    const map = new Map();
    const roots = [];
    
    // Crear mapa
    data.forEach(node => {
        map.set(node.id, { ...node, children: [] });
    });
    
    // Construir jerarquía
    map.forEach((node) => {
        if (node.parentId && map.has(node.parentId)) {
            map.get(node.parentId).children.push(node);
        } else {
            roots.push(node);
        }
    });
    
    return roots;
}

/**
 * Genera un color basado en un string (para colores consistentes)
 */
export function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Exporta datos a CSV
 */
export function exportToCSV(data) {
    const headers = ['ID', 'Nombre', 'Cargo', 'Departamento', 'Sueldo', 'Email', 'Reporta a'];
    
    const rows = data.map(node => [
        node.id,
        node.name || '',
        node.position || '',
        node.department || '',
        node.salary || 0,
        node.email || '',
        node.parentId || ''
    ]);
    
    const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    return csv;
}

/**
 * Descarga un archivo
 */
export function downloadFile(content, filename, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

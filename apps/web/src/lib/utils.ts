import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Genera un ID único
 */
export function generateId(): string {
  return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Formatea un número como moneda peruana
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Debounce - retrasa la ejecución hasta que pase un tiempo sin llamadas
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return function executedFunction(...args: Parameters<T>) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

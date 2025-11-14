import type { ParsedAccountCode } from '../types';

/**
 * Parsea un código de cuenta contable
 * Formato esperado: "133-001-000-000-00"
 * 
 * @param code - Código completo de la cuenta
 * @returns Objeto con el código parseado
 */
export function parseAccountCode(code: string): ParsedAccountCode | null {
  if (!code || typeof code !== 'string') {
    return null;
  }

  const trimmed = code.trim();
  
  // Regex para detectar formato: ###-###-###-###-##
  const accountCodeRegex = /^(\d{3})-(\d{3})-\d{3}-\d{3}-\d{2}$/;
  const match = trimmed.match(accountCodeRegex);

  if (!match) {
    return null;
  }

  const mainGroup = match[1]; // Primer grupo (ej: "133")
  const accountCode = match[2]; // Segundo grupo (ej: "001")

  return {
    full: trimmed,
    mainGroup,
    accountCode,
    isApk: mainGroup === '133',
    isGg: mainGroup !== '133',
  };
}

/**
 * Extrae solo el código de cuenta (segundo número) de un código completo
 * 
 * @param code - Código completo (ej: "133-001-000-000-00")
 * @returns Código de cuenta (ej: "001") o null si no es válido
 */
export function extractAccountCode(code: string): string | null {
  const parsed = parseAccountCode(code);
  return parsed?.accountCode || null;
}

/**
 * Valida si un código de cuenta es válido
 * 
 * @param code - Código a validar
 * @returns true si el código es válido
 */
export function isValidAccountCode(code: string): boolean {
  return parseAccountCode(code) !== null;
}

/**
 * Determina el tipo de datos basado en el código de cuenta
 * 
 * @param code - Código completo de cuenta
 * @returns 'apk' si es 133-xxx, 'gg' si es otro
 */
export function getDataTypeFromAccountCode(code: string): 'apk' | 'gg' | null {
  const parsed = parseAccountCode(code);
  if (!parsed) return null;
  return parsed.isApk ? 'apk' : 'gg';
}

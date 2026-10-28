const DEFAULT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
}

// Fecha de hoy como YYYY-MM-DD según la hora de México, sin pasar por UTC
// (toISOString() da el día siguiente entre las 18:00 y medianoche en America/Mexico_City).
export function getTodayMexico(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

// Para fechas calendario sin hora (ej. fecha de asignación, de compra, programada).
// Se fuerza timeZone: 'UTC' porque estos valores se guardan como medianoche UTC
// del día calendario seleccionado; formatear en hora local los movería un día atrás
// en zonas horarias negativas (ej. America/Mexico_City).
export function formatDate(
  d: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = {},
): string {
  if (!d) return '—'
  const date = d instanceof Date ? d : new Date(d)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('es-MX', {
    ...DEFAULT_OPTIONS,
    ...options,
    timeZone: 'UTC',
  })
}

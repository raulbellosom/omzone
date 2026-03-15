/**
 * Simula latencia de red para que los mocks se sientan como llamadas reales.
 * En producción, esto no existe — se reemplaza por el SDK de Appwrite.
 */
export const delay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms))

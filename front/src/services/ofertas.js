import { authHttp } from "./http-client";

/**
 * Obtiene una oferta específica por su ID
 * @param {string} idOferta - ID de la oferta
 * @returns {Promise<Object>} Datos de la oferta
 */
export async function obtenerOfertaPorId(idOferta) {
  const { data } = await authHttp.get(`/ofertas/${idOferta}`);
  return data;
}

/**
 * Obtiene la oferta asociada a un comercio específico
 * @param {string} idComercio - ID del comercio
 * @returns {Promise<Object>} Oferta del comercio
 */
export async function obtenerOfertaPorComercio(idComercio) {
  const { data } = await authHttp.get(`/ofertas/comercio/${idComercio}`);
  return data;
}

/**
 * Lista todas las ofertas activas disponibles
 * @returns {Promise<Array>} Array de ofertas activas
 */
export async function listarOfertasActivas() {
  const { data } = await authHttp.get("/ofertas/activas");
  return data;
}

/**
 * Obtiene ofertas cercanas a una ubicación
 * @param {number} latitud - Latitud de la ubicación
 * @param {number} longitud - Longitud de la ubicación
 * @param {number} radio - Radio de búsqueda en metros (default: 5000)
 * @returns {Promise<Array>} Array de ofertas cercanas
 */
export async function obtenerOfertasCercanas(latitud, longitud, radio = 5000) {
  const { data } = await authHttp.get("/ofertas/cercanas", {
    params: { latitud, longitud, radio }
  });
  return data;
}

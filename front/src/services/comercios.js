import { authHttp } from "./http-client";

/**
 * Obtiene un comercio específico por su ID
 * @param {string} idComercio - ID del comercio
 * @returns {Promise<Object>} Datos del comercio
 */
export async function obtenerComercioPorId(idComercio) {
    const { data } = await authHttp.get(`/comercios/${idComercio}`);
    return data;
}

/**
 * Lista todos los comercios disponibles (activos y aprobados)
 * @returns {Promise<Array>} Array de comercios
 */
export async function listarComercios() {
    const { data } = await authHttp.get("/comercios");
    return data;
}

/**
 * Obtiene los comercios del usuario autenticado
 * @returns {Promise<Array>} Array de comercios del usuario
 */
export async function obtenerMisComercios() {
    const { data } = await authHttp.get("/comercios/mis-comercios");
    return data;
}

/**
 * Registra un nuevo comercio
 * @param {Object} datosComercio - Datos del comercio a registrar
 * @returns {Promise<Object>} Comercio creado
 */
export async function registrarComercio(datosComercio) {
    const { data } = await authHttp.post("/comercios", datosComercio);
    return data;
}

/**
 * Edita un comercio existente
 * @param {string} idComercio - ID del comercio a editar
 * @param {Object} datosActualizados - Datos a actualizar
 * @returns {Promise<Object>} Comercio actualizado
 */
export async function editarComercio(idComercio, datosActualizados) {
    const { data } = await authHttp.put(`/comercios/${idComercio}`, datosActualizados);
    return data;
}

/**
 * Obtiene comercios cercanos a una ubicación
 * @param {number} latitud - Latitud de la ubicación
 * @param {number} longitud - Longitud de la ubicación
 * @param {number} radio - Radio de búsqueda en metros (default: 5000)
 * @returns {Promise<Array>} Array de comercios cercanos
 */
export async function obtenerComerciosCercanos(latitud, longitud, radio = 5000) {
    const { data } = await authHttp.get("/comercios/cercanos", {
        params: { latitud, longitud, radio }
    });
    return data;
}

/**
 * Busca comercios por término de búsqueda
 * @param {string} termino - Término de búsqueda
 * @returns {Promise<Array>} Array de comercios que coinciden
 */
export async function buscarComercios(termino) {
    const { data } = await authHttp.get("/comercios/buscar", {
        params: { q: termino }
    });
    return data;
}

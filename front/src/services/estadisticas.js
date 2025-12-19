import { authHttp } from './http-client';

/**
 * Obtiene las estadísticas del usuario autenticado
 * @returns {Promise<{dineroAhorrado: number, productosSalvados: number}>}
 */
export const obtenerEstadisticasUsuario = async () => {
    const response = await authHttp.get('/auth/estadisticas');
    return response.data;
};

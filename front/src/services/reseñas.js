import { authHttp } from "./http-client";

// Obtener todas las reseñas de un comercio
export async function obtenerReseñas(comercioId) {
    const { data } = await authHttp.get(`/resenas/comercio/${comercioId}`);
    return data;
}

// Verificar si el usuario puede reseñar un comercio
export async function verificarPuedeReseñar(comercioId) {
    const { data } = await authHttp.get(`/resenas/comercio/${comercioId}/puede-resenar`);
    return data;
}

// Crear una nueva reseña
export async function crearReseña(comercioId, datos) {
    const respuesta = await authHttp.post(`/resenas/comercio/${comercioId}`, datos);
    return respuesta.data;
}

// Editar una reseña existente
export async function editarReseña(reseñaId, datos) {
    const respuesta = await authHttp.put(`/resenas/${reseñaId}`, datos);
    return respuesta.data;
}

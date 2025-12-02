import axios from "axios";

export async function obtenerCoordenadas(direccion) {
  if (!direccion || !direccion.trim()) return null;

  const claveAPI = process.env.GOOGLE_MAPS_API_KEY;
  if (!claveAPI) {
    console.error("Falta GOOGLE_MAPS_API_KEY en el archivo .env");
    return null;
  }

  const url = "https://maps.googleapis.com/maps/api/geocode/json";

  try {
    const { data } = await axios.get(url, {
      params: { address: direccion, key: claveAPI, region: "AR" }, // region=AR mejora precisión
    });

    if (!data.results || data.results.length === 0) {
      console.warn("No se encontraron resultados para la dirección:", direccion);
      return null;
    }

    const mejorResultado = data.results[0];
    const latitud = mejorResultado.geometry.location.lat;
    const longitud = mejorResultado.geometry.location.lng;
    const direccionNormalizada = mejorResultado.formatted_address;

    return {
      direccion: direccionNormalizada,
      latitud,
      longitud,
    };
  } catch (error) {
    console.error("Error al obtener coordenadas de Google Maps:", error.message);
    return null;
  }
}
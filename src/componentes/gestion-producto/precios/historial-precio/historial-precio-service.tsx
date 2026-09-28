import axios from "axios";
import axiosConfig from "../../../../utils/axiosConfig";
import { HistorialPrecioProducto } from "../../../../interfaces/gestion-producto/historial-precios/interfaces-historial-precios";

const apiUrl = axiosConfig.apiUrl;

const HistorialPrecioProductoService = {
  /**
   * Obtiene el historial de cambios de precio de un producto paginado.
   * GET /producto/:productoId/historial-precio
   */
  obtenerPorProducto: async (
    productoId: number,
    skip = 0,
    take = 20,
  ): Promise<{ data: HistorialPrecioProducto[]; total: number }> => {
    const token = localStorage.getItem("Token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const { data } = await axios.get(
      `${apiUrl}/producto/${productoId}/historial-precio`,
      { headers, params: { skip, take } },
    );
    console.log("Historial service Front:", data);
    return data;
  },
};

export default HistorialPrecioProductoService;

import axios from "axios";
import axiosConfig from "../../../../utils/axiosConfig";
import { PreviewProductoAjusteMasivo } from "../../../../interfaces/gestion-producto/precios/interfaces-precios";

const apiUrl = axiosConfig.apiUrl;

export interface AjusteMasivoPrecioPayload {
  tipoAjuste: "porcentaje" | "monto";
  valor: number;
  alcance: "linea" | "global";
  lineaId?: number;
  usuarioId: number;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("Token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const ActualizacionMasivaService = {
  previsualizar: async (payload: AjusteMasivoPrecioPayload): Promise<PreviewProductoAjusteMasivo[]> => {
    const { data } = await axios.post(`${apiUrl}/producto/precios/actualizacion-masiva/preview`, payload, {
      headers: getAuthHeaders(),
    });
    return data;
  },

  confirmar: async (payload: AjusteMasivoPrecioPayload) => {
    const { data } = await axios.put(`${apiUrl}/producto/precios/actualizacion-masiva`, payload, {
      headers: getAuthHeaders(),
    });
    return data;
  },
};

export default ActualizacionMasivaService;

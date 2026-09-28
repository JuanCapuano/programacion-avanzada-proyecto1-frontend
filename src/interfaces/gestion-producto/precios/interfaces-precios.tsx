export interface ImportacionPrecioProducto {
  denominacion: string;
  precioOriginal: number;
  nuevoPrecio: number;
}

export interface PreviewProductoAjusteMasivo {
  id: number;
  denominacion: string;
  costoActual: number;
  costoResultante: number;
  porcentajeActual: number;
  porcentajeResultante: number;
  precioActual: number;
  precioResultante: number;
  valido: boolean;
}

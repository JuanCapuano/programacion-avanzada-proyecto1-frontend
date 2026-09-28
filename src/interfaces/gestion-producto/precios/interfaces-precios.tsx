export interface ImportacionPrecioProducto {
  denominacion: string;
  precioOriginal: number;
  nuevoPrecio: number;
}

export interface PreviewProductoAjusteMasivo {
  id: number;
  denominacion: string;
  precioActual: number;
  precioResultante: number;
  porcentajeResultante: number;
  valido: boolean;
}

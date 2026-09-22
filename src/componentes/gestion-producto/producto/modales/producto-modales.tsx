import { Producto } from "../../../../interfaces/gestion-producto/producto/interfaces-producto";
import InformacionAuditoria from "../../../herramientas/reutilizables/informacion-auditoria";
import RegistrarActualizarProductoForm from "../utils/registrar-actualizar-producto";
import FormularioAjusteMasivo from "../../precios/actualizacion-masiva/utils/formulario-ajuste-masivo";
import HistorialPrecioProductoComponent from "../../precios/historial-precio/consultar-historial-precio-producto";

interface Props {
  isAltaOpen: boolean;
  mostrarActualizarProducto: boolean;
  mostrarInfoAuditoria: boolean;
  mostrarMovimientosStock: boolean;
  mostrarHistorialPrecios: boolean;
  mostrarCambioPrecios: boolean;
  mostrarProductosAlternativos: boolean;
  mostrarDeQuienEsAlternativo: boolean;
  mostrarAjusteMasivo: boolean;
  productoSeleccionado: Producto | null;
  productoInfo: any;
  auditoria: any;
  onCloseAlta: () => void;
  onCloseActualizar: () => void;
  onCloseAuditoria: () => void;
  onCloseMovimientosStock: () => void;
  onCloseHistorialPrecios: () => void;
  onCloseCambioPrecios: () => void;
  onCloseProductosAlternativos: () => void;
  onCloseDeQuienEsAlternativo: () => void;
  onCloseAjusteMasivo: () => void;
  onSuccessAlta: (mensaje: string, producto?: Producto) => void;
  onSuccessActualizar: (mensaje: string) => void;
  onSuccessAjusteMasivo: () => void;
  onRefetch: () => void;
}

export function ProductosModales({
  isAltaOpen,
  mostrarActualizarProducto,
  mostrarInfoAuditoria,
  mostrarMovimientosStock,
  mostrarHistorialPrecios,
  mostrarCambioPrecios,
  mostrarProductosAlternativos,
  mostrarDeQuienEsAlternativo,
  mostrarAjusteMasivo,
  productoSeleccionado,
  productoInfo,
  auditoria,
  onCloseAlta,
  onCloseActualizar,
  onCloseAuditoria,
  onCloseMovimientosStock,
  onCloseHistorialPrecios,
  onCloseCambioPrecios,
  onCloseProductosAlternativos,
  onCloseDeQuienEsAlternativo,
  onCloseAjusteMasivo,
  onSuccessAlta,
  onSuccessActualizar,
  onSuccessAjusteMasivo,
  onRefetch,
}: Props) {
  return (
    <>
      {isAltaOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <RegistrarActualizarProductoForm onClose={onCloseAlta} onSuccess={onSuccessAlta} />
        </div>
      )}

      {mostrarActualizarProducto && productoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <RegistrarActualizarProductoForm
            producto={productoSeleccionado}
            onClose={onCloseActualizar}
            onSuccess={onSuccessActualizar}
          />
        </div>
      )}

      {mostrarInfoAuditoria && auditoria && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <InformacionAuditoria auditoria={auditoria} onClose={onCloseAuditoria} />
        </div>
      )}

      {mostrarHistorialPrecios && productoInfo && (
        <HistorialPrecioProductoComponent
          producto={productoInfo}
          onClose={onCloseHistorialPrecios}
        />
      )}
      {mostrarAjusteMasivo && (
        <FormularioAjusteMasivo onClose={onCloseAjusteMasivo} onSuccess={onSuccessAjusteMasivo} />
      )}
    </>
  );
}

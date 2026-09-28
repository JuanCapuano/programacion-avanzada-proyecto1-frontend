import { useEffect, useState } from "react";
import { Info, Layers, Pencil, PlusCircle, Trash } from "lucide-react";
import { Button } from "./../../ui/Button";
import { Superlinea } from "./../../../interfaces/gestion-producto/superlinea/interfaces-superlinea";
import Paginacion from "./../../herramientas/reutilizables/paginacion";
import { TablaAGGrid, Column } from "./../../herramientas/tablas/tabla-flexible-ag-grid";
import { useFiltrosContext } from "./../../../context/filtros-contesxt";
import { Card, CardContent, CardHeader, CardTitle } from "./../../ui/Card";
import {
  TipoAlertaConfirmacion,
  TituloAlertaConfirmacion,
  useConfirmation,
} from "./../../herramientas/alertas/alertas-confirmacion";
import { Alertas, TipoAlerta, TituloAlerta, useAlerts } from "./../../herramientas/alertas/alertas";
import { Auditoria, ResponsePost } from "./../../../interfaces/generales/interfaces-generales";
import InformacionAuditoria from "./../../herramientas/reutilizables/informacion-auditoria";
import {
  denominacionNotScrollColumnProps,
  observacionesColumnProps,
} from "./../../herramientas/tablas/formateo-columnas-documentos";
import { EstadisticasSimples } from "./../../herramientas/reutilizables/estadisticas-simples";
import { ImpresionForm } from "./../../herramientas/reutilizables/impresion-form";
import { getUsuarioId } from "./../../../utils/auth";
import { FiltrosSuperlinea, FiltrosSuperlineaValues } from "./componentes/filtros-superlinea";
import SuperlineaService from "./services/superlinea-service";
import RegistrarActualizarSuperlineaForm from "./utils/registrar-actualizar-superlinea";

const NOMBRE_COMPONENTE = "consultar-superlinea";

export default function ConsultarSuperLinea() {
  const [superlineas, setSuperlineas] = useState<Superlinea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [mostrarActualizarSuperlinea, setMostrarActualizarSuperlinea] = useState(false);
  const [superlineaSeleccionada, setSuperlineaSeleccionada] = useState<Superlinea>({} as Superlinea);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { alerts, addAlert, removeAlert } = useAlerts();
  const { showConfirmation, AlertasConfirmacion } = useConfirmation();

  const [mostrarInfoAuditoria, setMostrarInfoAuditoria] = useState(false);
  const [auditoria, setAuditoria] = useState<Auditoria>({} as Auditoria);

  // MANEJO DE PAGINACION =======================================
  const [paginaActual, setPaginaActual] = useState(1);
  const [entidadesTotales, setEntidadesTotales] = useState(1);
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(10);
  // MANEJO DE PAGINACION =======================================

  const usuarioId = getUsuarioId();

  // MANEJO DE FILTROS ========================================================
  const [filtrosInicializados, setFiltrosInicializados] = useState(false);
  const { setFiltrosNecesarios, limpiarFiltros, buscar, setBuscar } = useFiltrosContext();

  const [filtrosSuperlinea, setFiltrosSuperlinea] = useState<FiltrosSuperlineaValues>({
    denominacion: "",
  });

  useEffect(() => {
    limpiarFiltros();
    setBuscar({ cont: 0, componente: NOMBRE_COMPONENTE });
    setFiltrosNecesarios({
      denominacion: true,
    });
    setFiltrosInicializados(true);
  }, []);

  useEffect(() => {
    if (buscar.cont > 0 && buscar.componente === NOMBRE_COMPONENTE) {
      handleBuscarSuperlineas(true);
    }
  }, [buscar]);

  // MANEJO DE FILTROS ========================================================

  const handleAbrirActualizarSuperlinea = async (id: number) => {
    if (id) {
      const superlinea = await SuperlineaService.obtenerId(id);
      setSuperlineaSeleccionada(superlinea);
      setMostrarActualizarSuperlinea(true);
    }
  };

  const handleCerrarActualizarSuperlinea = () => {
    setMostrarActualizarSuperlinea(false);
    setSuperlineaSeleccionada({} as Superlinea);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await showConfirmation({
      type: TipoAlertaConfirmacion.DESTRUCTIVE,
      title: TituloAlertaConfirmacion.DESTRUCTIVE,
      message:
        "¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: () => {},
    });

    if (!confirmed) return;

    let response: ResponsePost;
    try {
      response = await SuperlineaService.eliminar(id, usuarioId);

      setSuperlineas(superlineas.filter((sl) => sl.id !== id));

      addAlert({
        type: TipoAlerta.SUCCESS,
        title: TituloAlerta.SUCCESS,
        message: response.mensaje,
        autoClose: true,
        duration: 3000,
      });
    } catch (err: any) {
      addAlert({
        type: TipoAlerta.ERROR,
        title: TituloAlerta.ERROR,
        message:
          "No se puede eliminar este elemento porque está siendo utilizado por una o más líneas.",
        autoClose: true,
        duration: 3000,
      });
    }
  };

  const handleMostrarInfo = async (id: number) => {
    if (id) {
      const datosAuditoria = await SuperlineaService.obtenerAuditoria(id);
      setAuditoria(datosAuditoria);
      setMostrarInfoAuditoria(true);
    }
  };

  const handleCerrarInfo = () => {
    setMostrarInfoAuditoria(false);
    setAuditoria({} as Auditoria);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSuccess = async (mensajeAlerta: string) => {
    closeModal();

    addAlert({
      type: TipoAlerta.SUCCESS,
      title: TituloAlerta.SUCCESS,
      message: mensajeAlerta,
      autoClose: true,
      duration: 3000,
    });

    setLoading(true);

    const filtrosConPaginacion = {
      denominacion: filtrosSuperlinea.denominacion,
      skip,
      take,
    };

    const result = await SuperlineaService.obtener(filtrosConPaginacion);
    setEntidadesTotales(result.total);
    setPaginaActual(paginaActual);
    setSuperlineas(result.data);
    setLoading(false);
  };

  const handleActualizarSuccess = async (mensajeAlerta: string) => {
    closeModal();

    addAlert({
      type: TipoAlerta.SUCCESS,
      title: TituloAlerta.SUCCESS,
      message: mensajeAlerta,
      autoClose: true,
      duration: 3000,
    });

    await handleBuscarSuperlineas();
  };

  const handleBuscarSuperlineas = async (botonBuscar?: boolean) => {
    if (botonBuscar) {
      resetearPaginacion();
    }
    setLoading(true);

    const filtrosConPaginacion = {
      denominacion: filtrosSuperlinea.denominacion,
      skip,
      take,
    };

    const result = await SuperlineaService.obtener(filtrosConPaginacion);
    setSuperlineas(result.data);
    setEntidadesTotales(result.total);
    setLoading(false);
  };

  const handleBuscarDesdeFiltro = (filtros: FiltrosSuperlineaValues) => {
    setFiltrosSuperlinea(filtros);
  };

  // MANEJO DE PAGINACION ===========================================

  useEffect(() => {
    if (filtrosInicializados) {
      handleBuscarSuperlineas();
    }
  }, [paginaActual, filtrosInicializados]);

  useEffect(() => {
    if (filtrosInicializados) {
      handleBuscarSuperlineas(true);
    }
  }, [filtrosSuperlinea]);

  const handlePageChange = (skip: number, take: number, paginaActual: number) => {
    setSkip(skip);
    setTake(take);
    setPaginaActual(paginaActual);
  };

  function resetearPaginacion() {
    setSkip(0);
    setPaginaActual(1);
  }

  // MANEJO DE PAGINACION ===========================================

  const handleImprimirTodo = async () => {
    try {
      const pdfBlob = await SuperlineaService.imprimirTodo();
      const fileURL = URL.createObjectURL(new Blob([pdfBlob], { type: "application/pdf" }));
      window.open(fileURL, "_blank");
    } catch (error) {
      console.error("Error al generar el PDF:", error);
    }
  };

  const handleImprimirPagina = async () => {
    try {
      const pdfBlob = await SuperlineaService.imprimirPagina();
      const fileURL = URL.createObjectURL(new Blob([pdfBlob], { type: "application/pdf" }));
      window.open(fileURL, "_blank");
    } catch (error) {
      console.error("Error al generar el PDF:", error);
    }
  };

  const columns: Column<Superlinea>[] = [
    {
      header: "Denominación",
      accessor: "denominacion",
      ...denominacionNotScrollColumnProps,
    },
    {
      header: "Observación",
      accessor: "observacion",
      ...observacionesColumnProps,
    },
  ];

  return (
    <div className="w-full">
      <div className="p-6">
        {error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
              <p className="text-red-600 dark:text-red-400 text-center font-medium">{error}</p>
            </div>
          </div>
        ) : (
          <>
            <Card className="border-gray-200 dark:border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between p-4 gap-4">
                <div className="flex items-center gap-6">
                  <CardTitle className="flex items-center space-x-2">
                    <Layers className="consultar-icon" />
                    <span>SuperLíneas</span>
                    <EstadisticasSimples
                      filtrados={entidadesTotales}
                      mostrados={superlineas.length}
                    />
                  </CardTitle>
                </div>
                {/* Contenedor de botones */}
                <div className="flex items-center gap-2">
                  <ImpresionForm
                    entityName="SuperLíneas"
                    onImprimirTodo={handleImprimirTodo}
                    onImprimirPagina={handleImprimirPagina}
                    totalItems={entidadesTotales}
                    currentPage={paginaActual}
                  />
                  <Button
                    className="bg-blue-500 hover:bg-blue-700 text-white flex items-center px-4 py-3"
                    onClick={openModal}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Añadir
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <FiltrosSuperlinea onBuscar={handleBuscarDesdeFiltro} mostrarIncluirEliminados />

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      Cargando superlíneas...
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <TablaAGGrid
                      columns={columns}
                      data={superlineas}
                      onUpdate={() => {}}
                      actions={(row) => (
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAbrirActualizarSuperlinea(row.id)}
                            className="bg-blue-500 text-white hover:bg-blue-800 w-8 h-8 flex items-center justify-center"
                            title="Actualizar superlínea"
                          >
                            <Pencil size={18} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMostrarInfo(row.id)}
                            className="bg-blue-500 text-white hover:bg-blue-800 w-8 h-8 flex items-center justify-center"
                            title="Ver información de la superlínea"
                          >
                            <Info size={18} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(row.id)}
                            className={`w-8 h-8 flex items-center justify-center ${
                              row.sistema > 0
                                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                                : "bg-blue-500 text-white hover:bg-blue-800"
                            }`}
                            disabled={row.sistema > 0}
                          >
                            <Trash size={18} />
                          </Button>
                        </div>
                      )}
                      actionsFlex={1.1}
                      actionsScrollable={false}
                      rowHeight={55}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Paginación */}
            <div className="mt-6">
              <Paginacion
                entidadesTotales={entidadesTotales}
                take={take}
                paginaActual={paginaActual}
                onChange={handlePageChange}
              />
            </div>
          </>
        )}

        <Alertas alerts={alerts} onRemove={removeAlert} />
        <AlertasConfirmacion />
      </div>

      {/* Modal para Agregar SuperLínea */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <RegistrarActualizarSuperlineaForm onClose={closeModal} onSuccess={handleSuccess} />
            </div>
          </div>
        </div>
      )}

      {/* Modal para Mostrar Información de Auditoría */}
      {mostrarInfoAuditoria && auditoria && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <InformacionAuditoria auditoria={auditoria} onClose={handleCerrarInfo} />
              <div className="mt-6 pt-4 border-t">
                <Button onClick={handleCerrarInfo} className="btn btn-dark">
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Actualizar SuperLínea */}
      {mostrarActualizarSuperlinea && superlineaSeleccionada !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative p-6 sm:p-8 rounded-lg shadow-lg w-4/5 sm:w-3/5 md:w-2/3 lg:w-1/2 xl:w-2/5 max-w-full">
            <RegistrarActualizarSuperlineaForm
              superlinea={superlineaSeleccionada}
              onClose={handleCerrarActualizarSuperlinea}
              onSuccess={handleActualizarSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}

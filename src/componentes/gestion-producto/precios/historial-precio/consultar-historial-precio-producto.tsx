import { useState, useEffect } from "react";
import {
  History,
  X,
  ArrowUpRight,
  ArrowDownRight,
  UserCircle,
  CalendarClock,
  MessageSquareText,
  // TrendingUp, TrendingDown, Minus, // SIN USO: ver renderTendencia comentado
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/Card";
import { Button } from "../../../ui/Button";
import Paginacion from "../../../herramientas/reutilizables/paginacion";
import { formatPrice, formatPercentage } from "../../../herramientas/formateo-de-campos/fucion-formateo";
import { HistorialPrecioProducto } from "../../../../interfaces/gestion-producto/historial-precios/interfaces-historial-precios";
import HistorialPrecioProductoService from "./historial-precio-service";
import { Producto } from "../../../../interfaces/gestion-producto/producto/interfaces-producto";

interface Props {
  producto: Producto;
  onClose: () => void;
}

export default function HistorialPrecioProductoComponent({ producto, onClose }: Props) {
  const [registros, setRegistros] = useState<HistorialPrecioProducto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paginaActual, setPaginaActual] = useState(1);
  const [skip, setSkip] = useState(0);
  const [take] = useState(10);

  const fetchHistorial = async () => {
    console.log("[FRONT · HistorialPrecioComponent] fetchHistorial iniciado");
    console.log("[FRONT · HistorialPrecioComponent] producto recibido:", producto);
    console.log("[FRONT · HistorialPrecioComponent] producto.id:", producto?.id);

    if (!producto?.id) {
      console.warn("[FRONT · HistorialPrecioComponent] ⚠️ producto.id es undefined/null — abortando");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log(`[FRONT · HistorialPrecioService] GET /producto/${producto.id}/historial-precio — skip=${skip} take=${take}`);
      const result = await HistorialPrecioProductoService.obtenerPorProducto(
        producto.id,
        skip,
        take,
      );
      console.log("[FRONT · HistorialPrecioService] ✅ Respuesta:", result);
      console.log("[FRONT · HistorialPrecioService] total:", result.total, "registros:", result.data?.length);
      setRegistros(result.data);
      setTotal(result.total);
    } catch (err: any) {
      console.error("[FRONT · HistorialPrecioService] ❌ Error HTTP:", err?.response?.status, err?.response?.data ?? err?.message);
      setError("No se pudo cargar el historial de precios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("[FRONT · HistorialPrecioComponent] useEffect — producto.id:", producto?.id, "skip:", skip);
    fetchHistorial();
  }, [producto?.id, skip]);

  const handlePageChange = (nuevoSkip: number, nuevoTake: number, nuevaPagina: number) => {
    setSkip(nuevoSkip);
    setPaginaActual(nuevaPagina);
  };

  // DEPRECADO: la tendencia en rojo/verde se reemplazó por la columna
  // "Variación" en color neutro. Se comenta (no se borra) para referencia.
  //
  // /** Devuelve ícono y color según si el precio subió, bajó o quedó igual */
  // const renderTendencia = (anterior: number, nuevo: number) => {
  //   if (nuevo > anterior)
  //     return <TrendingUp size={16} className="text-red-500 shrink-0" title="Precio aumentó" />;
  //   if (nuevo < anterior)
  //     return <TrendingDown size={16} className="text-green-500 shrink-0" title="Precio bajó" />;
  //   return <Minus size={16} className="text-gray-400 shrink-0" />;
  // };

  /** Compara a 2 decimales (lo que se muestra) para no marcar cambios invisibles. */
  const cambio = (anterior: number, nuevo: number) =>
    Math.round(Number(anterior) * 100) !== Math.round(Number(nuevo) * 100);

  const formatNumero = (valor: number) =>
    valor.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /** Variación en color neutro: flecha + signo + diferencia (y % para montos). */
  const renderVariacion = (anterior: number, nuevo: number, tipo: "monto" | "porcentaje") => {
    const a = Number(anterior);
    const n = Number(nuevo);
    if (!cambio(a, n)) {
      return <span className="text-xs text-gray-400 dark:text-gray-500">Sin cambios</span>;
    }
    const diferencia = n - a;
    const signo = diferencia > 0 ? "+" : "−";
    const Flecha = diferencia > 0 ? ArrowUpRight : ArrowDownRight;
    const texto =
      tipo === "monto"
        ? `${signo}${formatPrice(Math.abs(diferencia), "ARS")}`
        : `${signo}${formatNumero(Math.abs(diferencia))} pts`;
    const relativo =
      tipo === "monto" && a > 0 ? ` (${signo}${formatNumero(Math.abs((diferencia / a) * 100))} %)` : "";

    return (
      <span className="inline-flex items-center gap-1 text-gray-800 dark:text-gray-100 font-medium">
        <Flecha size={14} className="text-slate-500 dark:text-slate-400 shrink-0" />
        {texto}
        <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">{relativo}</span>
      </span>
    );
  };

  /** Arma la frase "modificó el costo y el margen" según lo que cambió. */
  const describirCambios = (r: HistorialPrecioProducto) => {
    const campos: string[] = [];
    if (cambio(r.costoAnterior, r.costoNuevo)) campos.push("el costo");
    if (cambio(r.porcentajeAnterior, r.porcentajeNuevo)) campos.push("el margen");
    if (cambio(r.costoDolarAnterior, r.costoDolarNuevo)) campos.push("el costo USD");
    if (campos.length === 0) return "modificó el precio";
    if (campos.length === 1) return `modificó ${campos[0]}`;
    return `modificó ${campos.slice(0, -1).join(", ")} y ${campos[campos.length - 1]}`;
  };

  const renderFila = (
    etiqueta: string,
    anterior: number,
    nuevo: number,
    tipo: "monto" | "porcentaje",
    opciones: { esResultado?: boolean; moneda?: "ARS" | "USD" } = {},
  ) => {
    const modificado = cambio(anterior, nuevo);
    const formatear = (v: number) =>
      tipo === "monto" ? formatPrice(v, opciones.moneda ?? "ARS") : formatPercentage(v);

    return (
      <tr
        className={`border-t border-gray-100 dark:border-slate-700 ${
          modificado ? "bg-blue-50/60 dark:bg-blue-900/15" : ""
        }`}
      >
        <td className="py-2 pl-3 pr-2">
          <div className="flex items-center gap-2">
            {modificado && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
            <span
              className={`${modificado ? "font-medium text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"} ${
                opciones.esResultado ? "font-semibold" : ""
              }`}
            >
              {etiqueta}
            </span>
            {opciones.esResultado && (
              <span className="text-[10px] uppercase tracking-wide text-gray-400">resultado</span>
            )}
          </div>
        </td>
        <td className="py-2 px-2 text-right tabular-nums text-gray-500 dark:text-gray-400">
          {formatear(anterior)}
        </td>
        <td
          className={`py-2 px-2 text-right tabular-nums ${
            modificado ? "font-semibold text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {formatear(nuevo)}
        </td>
        <td className="py-2 pl-2 pr-3 text-right tabular-nums">{renderVariacion(anterior, nuevo, tipo)}</td>
      </tr>
    );
  };

  const formatFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Historial de precios
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[500px]">
                {producto?.denominacion}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Contenido ── */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3" />
              <p className="text-gray-500 text-sm">Cargando historial...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            </div>
          ) : registros.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <History size={40} className="mb-3 opacity-40" />
              <p className="text-sm">Este producto aún no tiene cambios de precio registrados.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {registros.map((r) => (
                <Card
                  key={r.id}
                  className="border border-gray-200 dark:border-slate-700 hover:shadow-sm transition-shadow"
                >
                  <CardContent className="p-4">
                    {/* ── Quién y qué cambió ── */}
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <UserCircle size={18} className="text-slate-500 dark:text-slate-400 shrink-0" />
                        <p className="text-sm text-gray-700 dark:text-gray-200">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {r.usuario || "Usuario desconocido"}
                          </span>{" "}
                          {describirCambios(r)}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 shrink-0">
                        <CalendarClock size={14} />
                        {formatFecha(r.fecha)}
                      </span>
                    </div>

                    {/* ── Motivo ── */}
                    <div className="flex items-start gap-2 mb-3 text-sm">
                      <MessageSquareText size={16} className="text-slate-400 mt-0.5 shrink-0" />
                      <p className="text-gray-600 dark:text-gray-300 break-words">
                        <span className="font-medium text-gray-700 dark:text-gray-200">Motivo:</span> {r.motivo}
                      </p>
                    </div>

                    {/* ── Anterior → Nuevo ── */}
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-700/40 text-xs text-gray-500 dark:text-gray-400">
                          <tr>
                            <th className="py-2 pl-3 pr-2 text-left font-medium">Campo</th>
                            <th className="py-2 px-2 text-right font-medium">Anterior</th>
                            <th className="py-2 px-2 text-right font-medium">Nuevo</th>
                            <th className="py-2 pl-2 pr-3 text-right font-medium">Variación</th>
                          </tr>
                        </thead>
                        <tbody>
                          {renderFila("Costo", r.costoAnterior, r.costoNuevo, "monto")}
                          {renderFila("Margen", r.porcentajeAnterior, r.porcentajeNuevo, "porcentaje")}
                          {(r.costoDolarNuevo > 0 || r.costoDolarAnterior > 0) &&
                            renderFila("Costo USD", r.costoDolarAnterior, r.costoDolarNuevo, "monto", { moneda: "USD" })}
                          {renderFila("Precio de venta", r.precioAnterior, r.precioNuevo, "monto", { esResultado: true })}
                        </tbody>
                      </table>
                    </div>

                    {/* DEPRECADO: grilla de tarjetas con precio en rojo/verde, reemplazada
                        por la tabla de arriba. Se desactiva (no se borra) para referencia. */}
                    {false && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">

                      {/* Precio */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Precio</p>
                        <p className="text-gray-500 dark:text-gray-400 line-through text-xs">
                          {formatPrice(r.precioAnterior, "ARS")}
                        </p>
                        <p className={`font-semibold ${r.precioNuevo > r.precioAnterior ? "text-red-600" : r.precioNuevo < r.precioAnterior ? "text-green-600" : "text-gray-700"}`}>
                          {formatPrice(r.precioNuevo, "ARS")}
                        </p>
                      </div>

                      {/* Costo */}
                      <div className="bg-gray-50 dark:bg-slate-700/40 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Costo</p>
                        <p className="text-gray-400 line-through text-xs">
                          {formatPrice(r.costoAnterior, "ARS")}
                        </p>
                        <p className="font-semibold text-gray-700 dark:text-gray-200">
                          {formatPrice(r.costoNuevo, "ARS")}
                        </p>
                      </div>

                      {/* Margen */}
                      <div className="bg-gray-50 dark:bg-slate-700/40 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Margen</p>
                        <p className="text-gray-400 line-through text-xs">
                          {formatPercentage(r.porcentajeAnterior)}
                        </p>
                        <p className="font-semibold text-gray-700 dark:text-gray-200">
                          {formatPercentage(r.porcentajeNuevo)}
                        </p>
                      </div>

                      {/* Costo USD (solo si hay valor) */}
                      {(r.costoDolarNuevo > 0 || r.costoDolarAnterior > 0) && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                          <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-1">
                            Costo USD (cotiz. {formatPrice(r.cotizacionDolarNuevo)})
                          </p>
                          <p className="text-gray-400 line-through text-xs">
                            {formatPrice(r.costoDolarAnterior, "USD")}
                          </p>
                          <p className="font-semibold text-gray-700 dark:text-gray-200">
                            {formatPrice(r.costoDolarNuevo, "USD")}
                          </p>
                        </div>
                      )}

                    </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* ── Paginación ── */}
        {!loading && !error && total > take && (
          <div className="px-6 py-3 border-t border-gray-200 dark:border-slate-700">
            <Paginacion
              entidadesTotales={total}
              take={take}
              paginaActual={paginaActual}
              onChange={handlePageChange}
            />
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-slate-700">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>

      </div>
    </div>
  );
}

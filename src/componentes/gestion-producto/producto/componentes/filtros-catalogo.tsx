import { useState } from "react";
import { Input } from "../../../ui/Input";
import { Button } from "../../../ui/Button";

export type FiltrosCatalogo = { texto: string };
const vacios: FiltrosCatalogo = { texto: "" };

export function FiltrosCatalogoProductos({ onBuscar, loading }: {
  onBuscar: (filtros: FiltrosCatalogo) => void;
  loading: boolean;
}) {
  const [filtros, setFiltros] = useState(vacios);
  return (
    <form aria-label="Buscar productos por catálogo" className="mb-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
      onSubmit={(event) => { event.preventDefault(); onBuscar(filtros); }}>
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[200px] flex-1 text-sm font-medium" htmlFor="catalogo-texto">
          Buscar productos
          <Input id="catalogo-texto" className="mt-1" maxLength={255}
            placeholder="Denominación, línea o superlínea..."
            value={filtros.texto} onChange={(event) => setFiltros({ texto: event.target.value })} />
        </label>
        <Button type="submit" disabled={loading}>Buscar productos</Button>
        <Button type="button" disabled={loading} onClick={() => { setFiltros(vacios); onBuscar(vacios); }}>Limpiar búsqueda</Button>
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Buscá por parte del nombre del producto, de su línea o de su superlínea.</p>
    </form>
  );
}

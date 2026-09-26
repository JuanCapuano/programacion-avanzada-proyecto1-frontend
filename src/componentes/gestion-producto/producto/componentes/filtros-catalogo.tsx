import { useState } from "react";
import { Input } from "../../../ui/Input";
import { Button } from "../../../ui/Button";

export type FiltrosCatalogo = {
  texto: string;
  buscarDenominacion: boolean;
  buscarLinea: boolean;
  buscarSuperLinea: boolean;
};
const vacios: FiltrosCatalogo = {
  texto: "", buscarDenominacion: true, buscarLinea: true, buscarSuperLinea: true,
};

export function FiltrosCatalogoProductos({ onBuscar, loading }: {
  onBuscar: (filtros: FiltrosCatalogo) => void;
  loading: boolean;
}) {
  const [filtros, setFiltros] = useState(vacios);
  const haySeleccion = filtros.buscarDenominacion || filtros.buscarLinea || filtros.buscarSuperLinea;
  return (
    <form aria-label="Buscar productos por catálogo" className="mb-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
      onSubmit={(event) => { event.preventDefault(); if (haySeleccion && !loading) onBuscar(filtros); }}>
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[200px] flex-1 text-sm font-medium" htmlFor="catalogo-texto">
          Buscar productos
          <Input id="catalogo-texto" className="mt-1" maxLength={255}
            placeholder="Denominación, línea o superlínea..."
            value={filtros.texto} onChange={(event) => setFiltros({ ...filtros, texto: event.target.value })} />
        </label>
        <Button type="submit" disabled={loading || !haySeleccion}>Buscar productos</Button>
        <Button type="button" disabled={loading} onClick={() => { setFiltros(vacios); onBuscar(vacios); }}>Limpiar búsqueda</Button>
      </div>
      <fieldset className="mt-3">
        <legend className="mb-2 text-sm">Buscar en:</legend>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {([
            ['buscarDenominacion', 'Denominación'],
            ['buscarLinea', 'Línea'],
            ['buscarSuperLinea', 'SuperLínea'],
          ] as const).map(([campo, etiqueta]) => (
            <label key={campo} className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-blue-600" checked={filtros[campo]}
                onChange={(event) => setFiltros({ ...filtros, [campo]: event.target.checked })} />
              {etiqueta}
            </label>
          ))}
        </div>
      </fieldset>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400" role={!haySeleccion ? 'status' : undefined}>
        {haySeleccion ? 'Se buscan coincidencias parciales en cualquiera de los campos seleccionados al presionar Buscar productos.' : 'Seleccioná al menos un campo para buscar.'}
      </p>
    </form>
  );
}

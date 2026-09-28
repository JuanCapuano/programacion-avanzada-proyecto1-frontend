import { useEffect, useState } from "react";
import Select from "react-select";
import { SelectSuperlinea } from "../../../../../interfaces/gestion-producto/superlinea/interfaces-superlinea";
import SuperlineaService from "../../../super-linea/services/superlinea-service";

interface SuperLineaSelectorProps {
  value?: number | null;
  onChange: (superlinea: SelectSuperlinea | null) => void;
  disabled?: boolean;
  error?: string;
}

export default function SuperLineaSelector({
  value,
  onChange,
  disabled = false,
  error,
}: SuperLineaSelectorProps) {
  const [superlineas, setSuperlineas] = useState<SelectSuperlinea[]>([]);
  const [seleccionada, setSeleccionada] = useState<SelectSuperlinea | null>(null);

  useEffect(() => {
    const cargarSuperlineas = async () => {
      try {
        const result = await SuperlineaService.obtener({ denominacion: "", skip: 0, take: 1000 });
        const opciones: SelectSuperlinea[] = result.data ?? result;
        setSuperlineas(opciones);

        if (value) {
          const encontrada = opciones.find((sl) => sl.id === value) ?? null;
          setSeleccionada(encontrada);
        }
      } catch (error) {
        console.error("Error al cargar superlíneas:", error);
      }
    };
    cargarSuperlineas();
  }, []);

  // Sincronizar si el valor externo cambia después del montaje
  useEffect(() => {
    if (!value) {
      setSeleccionada(null);
      return;
    }
    const encontrada = superlineas.find((sl) => sl.id === value) ?? null;
    setSeleccionada(encontrada);
  }, [value, superlineas]);

  const handleChange = (opt: SelectSuperlinea | null) => {
    setSeleccionada(opt);
    onChange(opt);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Super Línea
      </label>
      <Select
        value={seleccionada}
        options={superlineas}
        getOptionLabel={(o) => o.denominacion}
        getOptionValue={(o) => String(o.id)}
        onChange={(opt) => handleChange(opt as SelectSuperlinea | null)}
        isClearable
        isDisabled={disabled}
        placeholder="Buscar super línea..."
        noOptionsMessage={() => "Sin resultados"}
        menuPortalTarget={document.body}
        filterOption={(option, inputValue) =>
          option.label.toLowerCase().includes(inputValue.toLowerCase())
        }
        styles={selectStyles}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}

const selectStyles = {
  control: (base: any) => ({ ...base, color: "black" }),
  singleValue: (base: any) => ({ ...base, color: "black" }),
  option: (base: any, state: any) => ({
    ...base,
    color: state.isSelected ? "white" : "black",
    backgroundColor: state.isSelected
      ? "#3b82f6"
      : state.isFocused
      ? "#93c5fd"
      : "white",
  }),
  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
};

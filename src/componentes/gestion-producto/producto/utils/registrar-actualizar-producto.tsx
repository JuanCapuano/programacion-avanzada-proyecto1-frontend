import { useEffect, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CardContent, CardFooter, Card } from "../../../ui/Card";
import { Button } from "../../../ui/Button";
import FormInput from "../../../herramientas/formateo-de-campos/form-input";
import React from "react";
import ProductoService from "../services/producto-service";
import PriceInput from "../../../herramientas/formateo-de-campos/price-input";
import CantidadesInput from "../../../herramientas/formateo-de-campos/cantidades-input";
import { Producto, SelectPresentacion } from "../../../../interfaces/gestion-producto/producto/interfaces-producto";
import { SelectMarca } from "../../../../interfaces/gestion-producto/marca/interfaces-marca";
import { Linea, SelectLinea } from "../../../../interfaces/gestion-producto/linea/interfaces-linea";
import Select from "react-select";
import { NumericFormat } from "react-number-format";
import { Label } from "../../../ui/Label";
import { useEnterFocus } from "../../../herramientas/formateo-de-campos/movimiento-campos";
import { useConfiguracionSistema } from "../../../sistema/ConfiguracionSistemaContext";
import { parseApiError } from "../../../../utils/errores";
import { Layers } from "lucide-react";
import RegistrarActualizarMarcaForm from "../../marca/utils/registrar-actualizar-marca";
import { FormValues, schema, transformData, transformarItemsProdAlternativo, UNIDADES_MEDIDA, PORCENTAJE_DEFAULT } from "../interfaces/interfaces-validaciones-producto";
import LineasSelector from "../componentes/configuracion/lineas-selector";
import EncabezadoFormularios from "../../../ui/encabezadoFormularios";
import MarcasSelector from "../componentes/configuracion/marcas-selector";
import { getUsuarioId } from "../../../../utils/auth";
import RegistrarActualizarLineaForm from "../../linea/utils/registrar-actualizar-linea";
import PorcentajeInput from "../../../herramientas/formateo-de-campos/porcentaje-input";
import { ResponsePost } from "../../../../interfaces/generales/interfaces-generales";


export default function RegistrarActualizarProductoForm({
  producto,
  onClose,
  onSuccess,
}: {
  producto?: Producto;
  onClose: () => void;
  onSuccess: (mensajeAlerta: string) => void;
}) {
  //===================== CONSTANTES VARIAS ============================================
  const usuarioId = getUsuarioId();

  const { configuracion } = useConfiguracionSistema();
  const [rStockCritico, setStockCritico] = useState(false);
  const [pack, setPack] = useState(false);
  const [usaOferta, setUsaOferta] = useState(false);
  const [lineaSeleccionada, setLineaSeleccionada] = useState<Linea>({} as Linea);
  const [denominacionPrevisualizada, setDenominacionPrevisualizada] = useState<string>(producto?.denominacion ?? "" );
  const [denominacionEditadaManualmente, setDenominacionEditadaManualmente] = useState(false);
  const precioOriginal = useRef<number>(producto?.precio ?? 0);
  const costoOriginal = useRef<number>(producto?.costo ?? 0);

  console.log("Configuración del sistema:", configuracion);

  const methods = useForm<FormValues>({
    resolver: yupResolver(schema(rStockCritico, pack, usaOferta)),
    defaultValues: producto
      ? transformData(producto)
      : {
          porcentaje: PORCENTAJE_DEFAULT,
        },
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    watch,
    setError,
  } = methods;

  console.log("estos son los errores", errors);

  console.log("Producto que llega al formulario", producto);

  console.log("linea seleccionada", lineaSeleccionada);

  const [marcas, setMarcas] = React.useState<SelectMarca[]>([]);
  const [lineas, setLineas] = React.useState<SelectLinea[]>([]);
  
  const [denominacionMarca, setDenominacionMarca] = useState("");
  const [denominacionLinea, setDenominacionLinea] = useState("");
  const [selectedLinea, setSelectedLinea] = React.useState<SelectLinea>();
  const [selectedMarca, setSelectedMarca] = React.useState<SelectMarca>();
  const [mostrarFormularioLinea, setMostrarFormularioLinea] = useState(false);
  const [mostrarFormularioMarca, setMostrarFormularioMarca] = useState(false);
  const [itemProdAlternativoSinAgregar, setItemProdAlternativoSinAgregar] = useState(false);

  const stock = watch(`stock`);
  const stockMinimo = watch("stockMinimo");
  const cantidadPorPack = watch("cantidadPorPack");
  const utilizaStockMinimo = watch("utilizaStockMinimo");
  const utilizaPack = watch("utilizaPack");
  const marcaId = watch("marcaId");
  const lineaId = watch("lineaId");
  const denominacion = watch("denominacion");
  const presentacionCantidad = watch("presentacionCantidad");
  const presentacionUnidad = watch("presentacionUnidad");
  const costo = watch("costo");
  const porcentaje = watch("porcentaje");
  const precioCalculado = costo && porcentaje
    ? (costo + (costo * porcentaje / 100)).toFixed(2)
    : "0.00";

  //=============================== CONSTANTES PARA MOVIMIENTO ENTRE CAMPOS ==================================
  const denominacionProductoRef = useRef<HTMLInputElement>(null);
  useEnterFocus(denominacionProductoRef);
  const observacionRef = useRef<HTMLInputElement>(null);
  const selectTipoProductoRef = useRef<HTMLDivElement>(null);
  const precioOfertaRef = useRef<HTMLInputElement>(null);
  const denominacionLineaRef = useRef<HTMLInputElement>(null);
  const selectLineaRef = useRef<HTMLDivElement>(null);
  const denominacionMarcaRef = useRef<HTMLInputElement>(null);
  const selectMarcaRef = useRef<HTMLDivElement>(null);
  const usuarioEditoManualmente = useRef(false);
  const denominacionManualRef = useRef<string>("");

  const enterToObservacion = useEnterFocus(observacionRef);
  const enterToPrecioOferta = useEnterFocus(precioOfertaRef);
  const enterToDenominacionMarca = useEnterFocus(denominacionMarcaRef);

  //=============================== FUNCIONALIDAD ==================================

  useEffect(() => {
    if (!utilizaStockMinimo) {
      setValue("stockMinimo", 0);
    }
    if (!utilizaPack) {
      setValue("cantidadPorPack", 0);
    }
    
  }, [utilizaStockMinimo, utilizaPack, false, setValue]);

  useEffect(() => {
    setValue("stockMinimo", lineaSeleccionada.stockMinimo || 0);
    setValue("utilizaStockMinimo", lineaSeleccionada.utilizaStockMinimo || false);
  }, [lineaSeleccionada]);

  useEffect(() => {
    setPack(utilizaPack || false);
    setStockCritico(utilizaStockMinimo || false);
    setUsaOferta(false);
  }, [utilizaPack, utilizaStockMinimo, false]);

  useEffect(() => {
    if (usuarioEditoManualmente.current) return;
    if (!denominacionPrevisualizada) return;
    if (denominacion !== denominacionPrevisualizada) {
      setDenominacionEditadaManualmente(true);
    } else {
      setDenominacionEditadaManualmente(false);
    }
  }, [denominacion]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleBuscarPorDenominacion("LINEA");
    }, 300);
    return () => clearTimeout(timer);
  }, [denominacionLinea]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleBuscarPorDenominacion("MARCA");
    }, 300);
    return () => clearTimeout(timer);
  }, [denominacionMarca]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (producto) {
          setValue("lineaId", producto.linea.id || 0);
          setSelectedLinea(producto.linea);

          setValue("marcaId", producto.marca.id || 0);
          setSelectedMarca(producto.marca);

          
          setValue("denominacion", producto.denominacion || "");
          setValue("observacion", producto.observacion || null);
          setValue("codigoProveedor", producto.codigoProveedor || "");
          setValue("codigoBarra", producto.codigoBarra || null);
          setValue("stock", producto.stock || 0);
          setValue("costo", producto.costo || 0);
          setValue("porcentaje", producto.porcentaje ?? PORCENTAJE_DEFAULT);
          setValue("presentacionCantidad", producto.presentacionCantidad || 0);
          setValue("presentacionUnidad", producto.presentacionUnidad || "");

          //setValue("oferta", producto.oferta || false);

          setValue("stockMinimo", producto.stockMinimo || 0);
          setValue("utilizaStockMinimo", producto.utilizaStockMinimo || false);
          setValue("cantidadPorPack", producto.cantidadPorPack || 0);
          setValue("utilizaPack", producto.utilizaPack || false);
        
          console.error("llega aca", producto);
        
        }
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchData();
  }, [producto]);

  useEffect(() => {
    // Solo previsualizamos si no editó manualmente y si hay marca y línea
    if (denominacionEditadaManualmente) return;
    if (!marcaId || !lineaId) return;

    const previsualizar = async () => {
      try {
        const result = await ProductoService.previsualizarDenominacion(
          marcaId,
          lineaId,
          presentacionCantidad || undefined,
          presentacionUnidad || undefined,
        );
        setDenominacionPrevisualizada(result.denominacion);
      // Si es alta, seteamos la denominacion en el form directamente
        if (!producto && !denominacionEditadaManualmente) {
          setValue("denominacion", result.denominacion);
        }
      } catch {
      // Si falla la previsualización, no hacemos nada
      }
    };
      previsualizar();
  }, [marcaId, lineaId, presentacionCantidad, presentacionUnidad]);

  const onSubmit = async (formData: FormValues) => {
    console.log("denominacionEditadaManualmente:", denominacionEditadaManualmente);
    console.log("formData.denominacion:", formData.denominacion);
    let response: ResponsePost;

    try {
      // ⚠️ Validar si hay ítems sin agregar
      if (itemProdAlternativoSinAgregar) {
        const mensaje = [
          itemProdAlternativoSinAgregar ? "- Hay un producto alternativo sin agregar." : "",
          "",
          "¿Estás seguro de que querés registrar sin agregarlos?",
        ]
          .filter(Boolean)
          .join("\n");

        const confirmar = window.confirm(mensaje);

        if (!confirmar) return; // el usuario canceló
      }

    if (producto) {
      const { motivo, ...formDataSinMotivo } = formData;   // CR-007: el precio no se edita, se deriva de costo y porcentaje. Se calcula igual que el backend (Producto.calcularPrecio) para saber si cambió y, en ese caso, exigir el motivo.
      const costoNuevo = formData.costo ?? 0;
      const porcentajeNuevo = formData.porcentaje ?? 0;
      const precioNuevo = costoNuevo + (costoNuevo * porcentajeNuevo) / 100;
      const precioCambio = Math.round(precioNuevo * 1e5) !== Math.round(precioOriginal.current * 1e5); // Se compara a 5 decimales, la misma escala con la que el backend guarda el precio.

      if (precioCambio && !motivo?.trim()) {
        setError("motivo", {
          type: "manual",
          message: "El motivo es obligatorio cuando se modifica el precio.",
        });
        return;
      }

      const payload = {
        ...formDataSinMotivo,
        motivo: precioCambio ? motivo?.trim() : undefined,
        usuarioUpdatedId: usuarioId,
        denominacion: usuarioEditoManualmente.current ? denominacionManualRef.current : undefined,
      };

      response = await ProductoService.actualizar(producto.id, payload);

      // DEPRECADO (CR-007): el historial ya no se registra con una segunda
      // llamada; el backend no acepta más precio/precioAnterior desde el front.
      // Se comenta (no se borra) para referencia.
      //
      // await ProductoService.actualizarPreciosProducto(producto.id, {
      //   precio: precioNuevo,
      //   precioAnterior: precioOriginal.current,
      //   costo: formData.costo ?? 0,
      //   costoDolar: 0,
      //   cotizacionDolar: 0,
      //   porcentaje: formData.porcentaje ?? 0,
      //   motivo,
      //   usuarioId: usuarioId,
      // });
    }
       else {
        const payload = {
          ...formData,
          usuarioCreatedId: usuarioId,
          denominacion: usuarioEditoManualmente.current ? denominacionManualRef.current : undefined,
        };

        response = await ProductoService.nuevo(payload);
      }

      await onSuccess(response.mensaje);
      onClose();
    } catch (error) {
      const errorMessage = parseApiError(error);

      setError("root", {
        type: "manual",
        message: errorMessage,
      });
    }
  };

  const handleBuscarPorDenominacion = async (select: string) => {
    try {
      if (select === "LINEA") {
        if (!denominacionLinea.trim()) {
          setLineas([]); 
          return;
        }
        const lineas = await ProductoService.obtenerTotales({ denominacion: denominacionLinea }, "lineas");
        if (lineas) {
          console.log("Lineas encontradas:", lineas);
          setLineas(lineas.data);
        } else {
          console.log("No se encontró una linea con la denominación ingresada.");
        }
      }
      if (select === "MARCA") {
        if (!denominacionMarca.trim()) {
          setMarcas([]); // ← limpiar si está vacío
          return;
        }
        const marcas = await ProductoService.obtenerTotales({ denominacion: denominacionMarca }, "marcas");
        if (marcas) {
          console.log("Marcas encontradas:", marcas);
          setMarcas(marcas.data);
        } else {
          console.log("No se encontró una marca con la denominación ingresada.");
        }
      }
      
    } catch (error) {
      console.error("Error al buscar por código:", error);
    }
  };

  const handleEnterEnSelect = async (e: React.KeyboardEvent<HTMLInputElement>, select: string) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (select === "LINEA") {
        handleBuscarPorDenominacion("LINEA");
      }

      if (select === "MARCA") {
        handleBuscarPorDenominacion("MARCA");
      }

      setTimeout(() => {
        let selectDiv: HTMLDivElement | null = null;

        if (select === "MARCA") {
          selectDiv = selectMarcaRef.current;
        }

        if (select === "LINEA") {
          selectDiv = selectLineaRef.current;
        }

        if (select === "TIPO-PRODUCTO") {
          selectDiv = selectTipoProductoRef.current;
        }

        if (selectDiv) {
          const input = selectDiv.querySelector("input");
          if (input) {
            input.focus();
            input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
          }
        }
      }, 300); // Ajustá este delay según el tiempo de búsqueda, si es necesario
    }
  };



  return (
    <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50 overflow-y-auto py-5">
      <Card className="w-full max-w-7xl bg-white mx-auto shadow-lg rounded-2xl overflow-hidden relative mt-10 mb-12">
        <EncabezadoFormularios
          title={producto ? "Producto" : "Registrar Producto"}
          subtitle={
            producto
              ? "Sólo puede visualizarse, no modificarse."
            : "Ingresa los datos."
          }
          icon={<Layers className="form-icon" />}
          onClose={onClose}
        />  

        {/* Formulario */}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="flex flex-col gap-5 px-6 py-4">

              {/* ===== Datos Generales ===== */}
              <section className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Datos Generales</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 flex flex-col gap-1">

                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-700">Denominación</span>
                        {producto?.origenDenominacion && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          producto.origenDenominacion === 'AUTOMATICA'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {producto.origenDenominacion === 'AUTOMATICA' ? 'Automática' : 'Manual'}
                        </span>
                      )}
                      </div>
                      {producto && producto.origenDenominacion === 'MANUAL' && (
                        <button
                          type="button"
                          className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                          onClick={async () => {
                            try {
                              await ProductoService.restaurarDenominacion(producto.id, usuarioId);
                              await onSuccess("Denominación restaurada automáticamente");
                              onClose();
                            } catch {
                              setError("root", { type: "manual", message: "Error al restaurar la denominación" });
                            }
                          }}
                        >
                          Restauracion automática
                        </button>
                      )}
                      
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="checkbox"
                        id="editarDenominacion"
                        checked={denominacionEditadaManualmente}
                        onChange={(e) => {
                          usuarioEditoManualmente.current = e.target.checked;
                          setDenominacionEditadaManualmente(e.target.checked);
                          if (!e.target.checked) {
                            denominacionManualRef.current = "";
                            setValue("denominacion", denominacionPrevisualizada);
                          }
                          setDenominacionEditadaManualmente(e.target.checked);
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label htmlFor="editarDenominacion" className="text-sm text-gray-600">
                        Editar denominación manualmente
                      </label>
                    </div>

                    <FormInput
                      name="denominacion"
                      label=""
                      placeholder={
                        denominacionPrevisualizada && !denominacionEditadaManualmente
                          ? `Se generará: "${denominacionPrevisualizada}"`
                          : "Dejá vacío para generar automáticamente"
                      }
                      disabled={!denominacionEditadaManualmente || producto && producto.sistema > 0 ? true : false}
                      onKeyDown={enterToObservacion}
                      inputRef={denominacionProductoRef}
                      onChange={(e) => { 
                      usuarioEditoManualmente.current = true;
                      denominacionManualRef.current = e.target.value;
                      }}
                    />

                  {!producto && denominacionPrevisualizada && !denominacionEditadaManualmente && (
                    <p className="text-xs text-blue-600">
                      Se generará automáticamente: <strong>{denominacionPrevisualizada}</strong>
                    </p>
                  )}
                  </div>

                  <FormInput
                    name="codigoProveedor"
                    label="Codigo Interno"
                    placeholder="Ingresa el Codigo Interno"
                    disabled={producto && producto.sistema > 0 ? true : false}
                    className="md:col-span-2"  
                  />
                  {producto && (
                  <FormInput
                    name="motivo"
                    label="Motivo del cambio de precio (si modificaste el precio)"
                    placeholder="Ej: Aumento de costos del proveedor"
                    className="md:col-span-2" 
                    
                  />
                )}
                </div>
              </section>

              {/* ===== Clasificación ===== */}
              <section className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Clasificación</h3>

                <div className="flex flex-col gap-4">
                {/* Línea */}
                <div className="flex gap-2 items-end">
                  <div className="flex-shrink-0 border border-gray-300 rounded-md p-3 bg-gray-50">
                    <label className="text-sm font-medium text-gray-700 block mb-1">Buscar Línea</label>
                    <input
                      type="text"
                      placeholder="Nombre..."
                      value={denominacionLinea}
                      onChange={(e) => setDenominacionLinea(e.target.value)}
                      className="w-40 p-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-800"   
                    />  
                  </div>

                  <div className="flex-1">
                    <LineasSelector
                      denominacionLinea={denominacionLinea}
                      setDenominacionLinea={setDenominacionLinea}
                      denominacionLineaRef={denominacionLineaRef}
                      selectLineaRef={selectLineaRef}
                      lineas={lineas}
                      selectedLinea={selectedLinea}
                      lineaId={watch("lineaId")}
                      disabled={producto && producto.sistema > 0}
                      errors={errors}
                      onEnterLinea={(e) => handleEnterEnSelect(e, "LINEA")}
                      onEnterDenominacion={enterToDenominacionMarca}
                      onLineaChange={(linea) => {
                        methods.setValue("lineaId", linea?.id || 0);
                        setLineaSeleccionada(linea as any);
                      }}
                      onAgregarLinea={() => setMostrarFormularioLinea(true)}
                    />
                  </div>
                </div>

                {/* Marca */}
                <div className="flex gap-2 items-end">
                  <div className="flex-shrink-0 border border-gray-300 rounded-md p-3 bg-gray-50">
                    <label className="text-sm font-medium text-gray-700 block mb-1">Buscar Marca</label>
                    <input
                      type="text"
                      placeholder="Nombre..."
                      value={denominacionMarca}
                      onChange={(e) => setDenominacionMarca(e.target.value)}
                      className="w-40 p-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-800"
                    />
                  </div>

                  <div className="flex-1">
                    <MarcasSelector
                      denominacionMarca={denominacionMarca}
                      setDenominacionMarca={setDenominacionMarca}
                      denominacionMarcaRef={denominacionMarcaRef}
                      selectMarcaRef={selectMarcaRef}
                      marcas={marcas}
                      selectedMarca={selectedMarca}
                      marcaId={watch("marcaId")}
                      disabled={producto && producto.sistema > 0}
                      error={errors.marcaId?.message}
                      onEnterMarca={(e) => handleEnterEnSelect(e, "MARCA")}
                      onChangeMarca={(marca) => {
                        methods.setValue("marcaId", marca?.id || 0);
                      }}
                      onAgregarMarca={() => setMostrarFormularioMarca(true)}
                    />
                  </div>
                </div>
              </div>

              </section>

              {/* ===== Costo y Porcentaje ===== */}
              <section className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Costo y Porcentaje</h3>

                <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
                  <PriceInput
                    name="costo"
                    label="Costo"
                    value={watch("costo") || 0}
                    onChange={(value) => setValue("costo", value, { shouldValidate: true })}
                    maxDigits={9}
                    disabled={producto && producto.sistema > 0 ? true : false}
                  />
                  <PorcentajeInput
                    name="porcentaje"
                    label="Porcentaje"
                    value={watch("porcentaje") || 0}
                    onChange={(value) => setValue("porcentaje", value, { shouldValidate: true })}
                    disabled={producto && producto.sistema > 0 ? true : false}
                  />
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Precio
                  </label>
                  <input
                    type="text"
                    value={`$${precioCalculado}`}
                    disabled
                    className="w-full text-right p-2 border border-gray-300 bg-gray-100 rounded-md text-gray-600"
                  />
                </div>
              </section>

              {/* ===== Presentación ===== */}
              <section className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Presentación</h3>

                <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="presentacionCantidad" className="label-base">
                      Cantidad
                    </Label>
                    <div className="relative">
                      <NumericFormat
                        id="presentacionCantidad"
                        value={watch("presentacionCantidad") ?? 0}
                        thousandSeparator="."
                        decimalSeparator=","
                        allowedDecimalSeparators={[",", "."]}
                        decimalScale={2}
                        allowNegative={false}
                        disabled={producto && producto.sistema > 0 ? true : false}
                        onValueChange={(values) => setValue("presentacionCantidad", values.floatValue ?? 0, { shouldValidate: true })}
                        className={
                          producto && producto.sistema > 0
                            ? "w-full text-right p-2 border border-gray-300 bg-gray-300 rounded-md text-black"
                            : "w-full text-right p-2 border border-gray-300 bg-white rounded-md text-black"
                        }
                      />
                      {errors.presentacionCantidad && (
                        <small className="text-red-500">{errors.presentacionCantidad?.message as string}</small>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Unidad</label>
                    <Select
                      value={
                        UNIDADES_MEDIDA.map((u) => ({ id: u, denominacion: u })).find(
                          (option) => option.id === watch("presentacionUnidad"),
                        ) || null
                      }
                      options={UNIDADES_MEDIDA.map((u) => ({ id: u, denominacion: u }))}
                      getOptionLabel={(option) => option.denominacion}
                      getOptionValue={(option) => option.id}
                      isDisabled={producto && producto.sistema > 0 ? true : false}
                      onChange={(selectedOption) => {
                        setValue("presentacionUnidad", selectedOption?.id || "", { shouldValidate: true });
                      }}
                      className="text-black"
                      menuPortalTarget={document.body}
                      styles={{
                        control: (base) => ({ ...base, color: "black" }),
                        singleValue: (base) => ({ ...base, color: "black" }),
                        option: (base, { isSelected, isFocused }) => ({
                          ...base,
                          color: isSelected ? "white" : "black",
                          backgroundColor: isSelected ? "#3b82f6" : isFocused ? "#93c5fd" : "white",
                        }),
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                    />
                    {errors.presentacionUnidad && (
                      <small className="text-red-500">{errors.presentacionUnidad?.message as string}</small>
                    )}
                  </div>
                </div>
              </section>

              {/* ===== Stock y Empaque ===== */}
              <section className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Stock y Empaque</h3>

                <div className="flex flex-wrap gap-6 w-full">
                  {producto ? (
                    <div className="flex-1 min-w-[120px]">
                      <CantidadesInput
                        name={`stock`}
                        label="Stock"
                        value={stock || 0}
                        onChange={(value) => setValue(`stock`, Number(value))}
                        disabled={true}
                      />
                    </div>
                  ) : null}

                  <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                    <div className="flex flex-wrap gap-4 mt-8">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          {...methods.register("utilizaStockMinimo")}
                          className={` w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500`}
                          disabled={producto && producto.sistema > 0 ? true : false}
                        />
                      </label>
                    </div>

                    <CantidadesInput
                      name={`stockMinimo`}
                      label="Stock Crítico"
                      value={stockMinimo || 0}
                      onChange={(value) => setValue(`stockMinimo`, Number(value))}
                      disabled={/*utilizaStockMinimo ? false : */true}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1 min-w-[140px]">
                    <div className="flex flex-wrap gap-4 mt-8">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          {...methods.register("utilizaPack")}
                          className={`w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500`}
                          disabled={producto && producto.sistema > 0 ? true : false}
                        />
                      </label>
                    </div>

                    <CantidadesInput
                      name={`cantidadPorPack`}
                      label="Cantidad Pack"
                      value={cantidadPorPack || 0}
                      onChange={(value) => setValue(`cantidadPorPack`, Number(value))}
                      disabled={/*utilizaPack ? false : */true}
                    />
                  </div>
                </div>
              </section>

            </CardContent>

            {errors.root?.message && <div className="text-red-600 text-center mb-4">{String(errors.root.message)}</div>}

            {/* Botón de submit */}
            <CardFooter className="flex justify-center">
              <Button type="submit" disabled={isSubmitting} className="btn btn-dark">
                {isSubmitting
                  ? producto
                    ? "Actualizando..."
                    : "Registrando..."
                  : producto
                  ? "Actualizar"
                  : "Registrar"}
              </Button>
            </CardFooter>
          </form>
        </FormProvider>

        {mostrarFormularioLinea && (
          <RegistrarActualizarLineaForm
            onClose={() => setMostrarFormularioLinea(false)}
            onSuccess={() => {
              setMostrarFormularioLinea(false);
              handleBuscarPorDenominacion("LINEA")
            }}
          />
        )}


        {mostrarFormularioMarca && (
          <RegistrarActualizarMarcaForm
            onClose={() => setMostrarFormularioMarca(false)}
            onSuccess={() => {
              setMostrarFormularioMarca(false);
              handleBuscarPorDenominacion("MARCA")
            }}
          />
        )}

       
      </Card>
    </div>
  );
}

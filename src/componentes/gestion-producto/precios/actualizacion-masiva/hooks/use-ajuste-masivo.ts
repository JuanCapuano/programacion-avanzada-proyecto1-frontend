import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import ProductoService from "../../../producto/services/producto-service";
import ActualizacionMasivaService, { AjusteMasivoPrecioPayload } from "../actualizacion-masiva-service";
import { FormValues, schema } from "../interfaces/interfaces-validaciones-ajuste-masivo";
import { SelectLinea } from "../../../../../interfaces/gestion-producto/linea/interfaces-linea";
import { PreviewProductoAjusteMasivo } from "../../../../../interfaces/gestion-producto/precios/interfaces-precios";
import { getUsuarioId } from "../../../../../utils/auth";

export function useAjusteMasivo() {
  const usuarioId = getUsuarioId();

  // ===================== FORM =====================
  const methods = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { valor: 0 },
  });

  const { watch, setValue } = methods;
  const alcance = watch("alcance");
  const tipoAjuste = watch("tipoAjuste");

  const [lineas, setLineas] = useState<SelectLinea[]>([]);
  const [preview, setPreview] = useState<PreviewProductoAjusteMasivo[] | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingConfirmar, setLoadingConfirmar] = useState(false);

  useEffect(() => {
    const fetchLineas = async () => {
      try {
        const lineasTotales = await ProductoService.obtenerTotales({ denominacion: " " }, "lineas");
        setLineas(lineasTotales.data ?? []);
      } catch (error) {
        console.error("Error al obtener líneas:", error);
      }
    };
    fetchLineas();
  }, []);

  const limpiarPreview = () => setPreview(null);

  // cualquier cambio en el formulario invalida el preview vigente
  useEffect(() => {
    const subscription = watch(() => limpiarPreview());
    return () => subscription.unsubscribe();
  }, [watch]);

  // si el alcance vuelve a "global", descartamos la línea seleccionada
  useEffect(() => {
    if (alcance === "global") setValue("lineaId", undefined);
  }, [alcance, setValue]);

  const todosValidos = !!preview && preview.length > 0 && preview.every((p) => p.valido);
  // Previsualizar es obligatorio: Confirmar solo se habilita con una previsualización
  // vigente y sin productos inválidos (cambiar el formulario la descarta).
  const puedeConfirmar = todosValidos;

  // ===================== SUBMIT =====================
  const armarPayload = (formData: FormValues): AjusteMasivoPrecioPayload => ({
    tipoAjuste: formData.tipoAjuste,
    valor: formData.valor,
    alcance: formData.alcance,
    lineaId: formData.alcance === "linea" ? formData.lineaId : undefined,
    usuarioId,
  });

  const handlePrevisualizar = async (formData: FormValues) => {
    setLoadingPreview(true);
    try {
      const resultado = await ActualizacionMasivaService.previsualizar(armarPayload(formData));
      setPreview(resultado);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleConfirmar = async (formData: FormValues) => {
    setLoadingConfirmar(true);
    try {
      const response = await ActualizacionMasivaService.confirmar(armarPayload(formData));
      limpiarPreview();
      return response;
    } finally {
      setLoadingConfirmar(false);
    }
  };

  return {
    methods,
    alcance,
    tipoAjuste,
    lineas,
    preview,
    loadingPreview,
    loadingConfirmar,
    todosValidos,
    puedeConfirmar,
    limpiarPreview,
    handlePrevisualizar,
    handleConfirmar,
  };
}

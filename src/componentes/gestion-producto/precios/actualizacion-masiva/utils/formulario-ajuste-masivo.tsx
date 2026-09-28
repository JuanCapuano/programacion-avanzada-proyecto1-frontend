import { Controller, FormProvider } from "react-hook-form";
import Select from "react-select";
import { NumericFormat } from "react-number-format";
import { DollarSign } from "lucide-react";
import { Card, CardContent, CardFooter } from "../../../../ui/Card";
import { Button } from "../../../../ui/Button";
import { Label } from "../../../../ui/Label";
import EncabezadoFormularios from "../../../../ui/encabezadoFormularios";
import { Alertas, TipoAlerta, TituloAlerta, useAlerts } from "../../../../herramientas/alertas/alertas";
import { parseApiError } from "../../../../../utils/errores";
import TablaPreviewActualizacionMasiva from "../componentes/tabla-preview-precios";
import { useAjusteMasivo } from "../hooks/use-ajuste-masivo";

interface Props {
  onClose: () => void;
  onSuccess?: (mensaje: string) => void;
}

const ALCANCE_OPTIONS = [
  { value: "global" as const, label: "Global (todos los productos)" },
  { value: "linea" as const, label: "Por línea" },
];

const TIPO_AJUSTE_OPTIONS = [
  { value: "costo_porcentual" as const, label: "Costo: aumentar o disminuir un porcentaje (%)" },
  { value: "costo_monto" as const, label: "Costo: sumar o restar un monto fijo ($)" },
  { value: "margen" as const, label: "Margen: asignar un nuevo valor (%)" },
];

const LABEL_VALOR = {
  costo_porcentual: "Porcentaje sobre el costo",
  costo_monto: "Monto a sumar/restar al costo",
  margen: "Nuevo margen",
};

export default function FormularioAjusteMasivo({ onClose, onSuccess }: Props) {
  const { alerts, addAlert, removeAlert } = useAlerts();

  const {
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
  } = useAjusteMasivo();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onPrevisualizar = handleSubmit(async (formData) => {
    try {
      await handlePrevisualizar(formData);
    } catch (error) {
      addAlert({
        type: TipoAlerta.ERROR,
        title: TituloAlerta.ERROR,
        message: parseApiError(error),
        autoClose: true,
        duration: 7000,
      });
    }
  });

  const onConfirmar = handleSubmit(async (formData) => {
    try {
      const response = await handleConfirmar(formData);
      onSuccess?.(response.mensaje);
    } catch (error) {
      addAlert({
        type: TipoAlerta.ERROR,
        title: TituloAlerta.ERROR,
        message: parseApiError(error),
        autoClose: true,
        duration: 7000,
      });
    }
  });

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-full items-center justify-center p-4">
        <Card className="w-full max-w-5xl bg-white shadow-lg rounded-2xl overflow-hidden">
          <EncabezadoFormularios
            title="Actualización masiva de precios"
            icon={<DollarSign className="form-icon" />}
            onClose={onClose}
          />

          <FormProvider {...methods}>
            <form onSubmit={onPrevisualizar}>
              <CardContent className="space-y-5 px-6 py-5">
                <section className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">Defina el alcance de la actualización</h3>

                  <div className="flex flex-col gap-1">
                    <Label>Alcance</Label>
                    <Controller
                      name="alcance"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={ALCANCE_OPTIONS.find((o) => o.value === field.value) ?? null}
                          options={ALCANCE_OPTIONS}
                          getOptionLabel={(o) => o.label}
                          getOptionValue={(o) => o.value}
                          onChange={(opt) => field.onChange(opt?.value)}
                          placeholder="Seleccione el alcance"
                          isSearchable={false}
                          className="text-black"
                          menuPortalTarget={document.body}
                          styles={selectStyles}
                        />
                      )}
                    />
                    {errors.alcance?.message && <p className="text-sm text-red-600">{errors.alcance.message}</p>}
                  </div>

                  {alcance === "linea" && (
                    <div className="flex flex-col gap-1">
                      <Label>Línea</Label>
                      <Controller
                        name="lineaId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={lineas.find((l) => l.id === field.value) ?? null}
                            options={lineas}
                            getOptionLabel={(o) => o.denominacion}
                            getOptionValue={(o) => String(o.id)}
                            onChange={(opt) => field.onChange(opt ? opt.id : undefined)}
                            placeholder="Seleccione una línea"
                            className="text-black"
                            menuPortalTarget={document.body}
                            styles={selectStyles}
                          />
                        )}
                      />
                      {errors.lineaId?.message && <p className="text-sm text-red-600">{errors.lineaId.message}</p>}
                    </div>
                  )}
                </section>

                <section className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">Defina el tipo de ajuste</h3>

                  <div className="flex flex-col gap-1">
                    <Label>Tipo de ajuste</Label>
                    <Controller
                      name="tipoAjuste"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={TIPO_AJUSTE_OPTIONS.find((o) => o.value === field.value) ?? null}
                          options={TIPO_AJUSTE_OPTIONS}
                          getOptionLabel={(o) => o.label}
                          getOptionValue={(o) => o.value}
                          onChange={(opt) => field.onChange(opt?.value)}
                          placeholder="Seleccione el tipo de ajuste"
                          isSearchable={false}
                          className="text-black"
                          menuPortalTarget={document.body}
                          styles={selectStyles}
                        />
                      )}
                    />
                    {errors.tipoAjuste?.message && <p className="text-sm text-red-600">{errors.tipoAjuste.message}</p>}
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label htmlFor="valor">
                      {LABEL_VALOR[tipoAjuste] ?? "Valor"}
                    </Label>
                    <Controller
                      name="valor"
                      control={control}
                      render={({ field }) => (
                        <NumericFormat
                          id="valor"
                          value={field.value}
                          thousandSeparator="."
                          decimalSeparator=","
                          decimalScale={2}
                          suffix={tipoAjuste === "costo_porcentual" || tipoAjuste === "margen" ? " %" : undefined}
                          prefix={tipoAjuste === "costo_monto" ? "$ " : undefined}
                          allowNegative
                          onValueChange={(values) => field.onChange(values.floatValue ?? 0)}
                          className="w-full text-right p-2 border border-gray-300 bg-white rounded-md text-black"
                        />
                      )}
                    />
                    {errors.valor?.message && <p className="text-sm text-red-600">{errors.valor.message}</p>}
                  </div>
                </section>

                {preview && (
                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700">Vista previa</h3>

                    {preview.length === 0 && (
                      <p className="text-sm text-red-800">No hay productos en el alcance seleccionado.</p>
                    )}

                    {preview.length > 0 && !todosValidos && (
                      <p className="text-sm text-red-800">
                        {preview.filter((p) => !p.valido).length} de {preview.length} productos quedarían con precio
                        inválido.
                      </p>
                    )}

                    <TablaPreviewActualizacionMasiva productos={preview} />
                  </section>
                )}
              </CardContent>

              <CardFooter className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
                {!preview && (
                  <p className="mr-auto text-sm text-gray-600">Debe previsualizar los cambios antes de confirmar.</p>
                )}

                {!preview && (
                  <Button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white" disabled={loadingPreview}>
                    {loadingPreview ? "Previsualizando..." : "Previsualizar"}
                  </Button>
                )}

                {preview && (
                  <Button type="button" className="bg-red-500 hover:bg-red-600 text-white" onClick={limpiarPreview}>
                    Cancelar
                  </Button>
                )}

                <Button
                  type="button"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={onConfirmar}
                  disabled={!puedeConfirmar || loadingConfirmar}
                >
                  {loadingConfirmar ? "Aplicando..." : "Confirmar"}
                </Button>
              </CardFooter>
            </form>
          </FormProvider>

          <Alertas
            alerts={alerts}
            onRemove={removeAlert}
            className="top-1/2 left-1/2 right-auto -translate-x-1/2 -translate-y-1/2"
          />
        </Card>
      </div>
    </div>
  );
}

const selectStyles = {
  control: (base: any) => ({ ...base, color: "black" }),
  singleValue: (base: any) => ({ ...base, color: "black" }),
  option: (base: any, state: any) => ({
    ...base,
    color: state.isSelected ? "white" : "black",
    backgroundColor: state.isSelected ? "#3b82f6" : state.isFocused ? "#93c5fd" : "white",
  }),
  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
};

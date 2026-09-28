import * as yup from "yup";

//===================== interfaces para las cosas que se van a ingresar en el formulario y es necesario validarlas ==========//

export const ALCANCES = ["global", "linea"] as const;
export const TIPOS_AJUSTE = ["costo_porcentual", "costo_monto", "margen"] as const;

//===================== schema de validacion ============================================//

export const schema = yup.object({
  alcance: yup
    .mixed<(typeof ALCANCES)[number]>()
    .oneOf(ALCANCES, "El alcance debe ser Global o Por línea.")
    .required("El alcance es obligatorio."),

  lineaId: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? undefined : value))
    .when("alcance", {
      is: "linea",
      then: (s) => s.typeError("Seleccioná una línea.").required("Seleccioná una línea."),
      otherwise: (s) => s.optional().nullable(),
    }),

  tipoAjuste: yup
    .mixed<(typeof TIPOS_AJUSTE)[number]>()
    .oneOf(TIPOS_AJUSTE, "El tipo de ajuste no es válido.")
    .required("El tipo de ajuste es obligatorio."),

  valor: yup
    .number()
    .typeError("El valor debe ser un número.")
    .required("El valor es obligatorio.")
    .when("tipoAjuste", {
      is: "margen",
      then: (s) => s.min(0, "El margen no puede ser negativo."),
      otherwise: (s) => s.notOneOf([0], "El valor no puede ser 0."),
    })
    .when("tipoAjuste", {
      is: "costo_porcentual",
      then: (s) => s.moreThan(-100, "El porcentaje debe ser mayor a -100%."),
    }),
});

export type FormValues = yup.InferType<typeof schema>;

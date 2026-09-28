import * as yup from "yup";

//===================== interfaces para las cosas que se van a ingresar en el formulario y es necesario validarlas ==========//

export const ALCANCES = ["global", "linea"] as const;
export const TIPOS_AJUSTE = ["porcentaje", "monto"] as const;

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
    .oneOf(TIPOS_AJUSTE, "El tipo de ajuste debe ser Porcentaje o Monto.")
    .required("El tipo de ajuste es obligatorio."),

  valor: yup
    .number()
    .typeError("El valor debe ser un número.")
    .required("El valor es obligatorio.")
    .notOneOf([0], "El valor no puede ser 0."),
});

export type FormValues = yup.InferType<typeof schema>;

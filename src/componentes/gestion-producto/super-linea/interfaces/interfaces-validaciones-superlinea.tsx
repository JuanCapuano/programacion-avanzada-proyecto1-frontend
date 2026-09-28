import * as yup from "yup";
import { Superlinea } from "../../../../interfaces/gestion-producto/superlinea/interfaces-superlinea";

//===================== interfaces ============================================//

export interface FormValuesSuperlinea {
  denominacion: string;
  observacion?: string | null;
}

//===================== schema de validacion ============================================//

export const schemaSuperlinea = yup.object().shape({
  denominacion: yup
    .string()
    .trim()
    .lowercase()
    .required("La denominación es obligatoria.")
    .max(255, "Máximo 255 caracteres.")
    .matches(
      /^[A-Za-z0-9 áéíóúÁÉÍÓÚñÑ]+$/,
      "Solo se permiten letras, números y espacios."
    ),
  observacion: yup.string().optional().nullable(),
});

//===================== transform data ============================================//

export const transformDataSuperlinea = (superlinea: Superlinea): FormValuesSuperlinea => {
  return {
    denominacion: superlinea.denominacion,
    observacion: superlinea.observacion ?? null,
  };
};

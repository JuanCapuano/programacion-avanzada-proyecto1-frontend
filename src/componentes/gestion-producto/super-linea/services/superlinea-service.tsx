import { createCrudService } from "../../../../utils/crudFactory";
import { FormValuesSuperlinea } from "../interfaces/interfaces-validaciones-superlinea";

const baseService = createCrudService<FormValuesSuperlinea>("super-linea");

const SuperlineaService = {
  ...baseService,
};

export default SuperlineaService;

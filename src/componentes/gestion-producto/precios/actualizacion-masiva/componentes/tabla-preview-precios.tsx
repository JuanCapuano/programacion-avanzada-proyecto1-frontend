import { PreviewProductoAjusteMasivo } from "../../../../../interfaces/gestion-producto/precios/interfaces-precios";
import { TablaAGGrid, Column } from "../../../../herramientas/tablas/tabla-flexible-ag-grid";
import { formatPrice } from "../../../../herramientas/formateo-de-campos/fucion-formateo";

type Props = {
  productos: PreviewProductoAjusteMasivo[];
};

export default function TablaPreviewActualizacionMasiva({ productos }: Props) {
  const columns: Column<PreviewProductoAjusteMasivo>[] = [
    {
      header: "Producto",
      accessor: "denominacion",
      flex: 1.5,
      type: "text",
      editable: false,
    },
    {
      header: "Precio actual",
      accessor: "precioActual",
      flex: 0.7,
      type: "text",
      align: "right",
      editable: false,
      formatFunction: ({ value }) => <span>{formatPrice(value, "ARS")}</span>,
    },
    {
      header: "Precio nuevo",
      accessor: "precioResultante",
      flex: 0.7,
      type: "text",
      align: "right",
      editable: false,
      formatFunction: ({ value }) => <span>{formatPrice(value, "ARS")}</span>,
    },
    {
      header: "Estado",
      accessor: "valido",
      flex: 0.7,
      type: "text",
      align: "center",
      editable: false,
      formatFunction: ({ value }) => (
        <span
          className={`px-3 py-1 text-sm font-semibold rounded-full ${
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {value ? "Válido" : "Inválido"}
        </span>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <TablaAGGrid
        columns={columns}
        data={productos}
        actionsFlex={0}
        getRowClass={(params) => (params.data && !params.data.valido ? "bg-red-50" : undefined)}
        rowHeight={55}
        height={400}
      />
    </div>
  );
}

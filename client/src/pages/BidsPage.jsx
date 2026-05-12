import { useCrud } from "../hooks/useCrud";
import { bidsApi } from "../api";
import DataTable from "../components/tables/DataTable";

const COLUMNS = [
  { key: "date", label: "תאריך", width: "95px" },
  { key: "time", label: "שעה", width: "75px" },
  { key: "clientName", label: "קליינט", width: "130px" },
  { key: "target", label: "יעד", width: "100px" },
  { key: "isApproved", label: "מאושר", type: "boolean", width: "70px" },
  { key: "freeBid", label: "חינם", type: "boolean", width: "60px" },
  { key: "totalAmount", label: "סה״כ", type: "number", width: "85px" },
];

export default function BidsPage() {
  const { data, isLoading, update, remove } = useCrud("bids", bidsApi);
  return (
    <DataTable title="הצעות מחיר" data={data} columns={COLUMNS} loading={isLoading}
      onEdit={(id, v) => update(id, v)} onDelete={remove}
      filterYear={false} searchFields={["clientName", "target"]} />
  );
}

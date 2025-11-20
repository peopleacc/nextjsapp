
import Orders_pen from "../../components/comp_orders/ord_pen";
import Orders_Prog from "../../components/comp_orders/ord_prog";
export default function OrdersPage() {
  return (
    <div className="flex flex-row w-full gap-4">
      <div className="w-1/2">
        <Orders_pen />
      </div>
      <div className="w-1/2">
        <Orders_Prog />
      </div>
    </div>
  );
}
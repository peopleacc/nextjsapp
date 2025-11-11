import { supabase } from "@/lib/supabaseClient"
import OrderRecent from "../components/orders";
import TableUser from "../components/user";

export default async function DashboardPage() {
  const { data: users, error } = await supabase.from("User").select("*")

  console.log("Data dari Supabase:", users)
  console.log("Error:", error)

  if (error) return <div>Error: {error.message}</div>
  if (!users?.length) return <div>Tidak ada data user.</div>

  return (
    <>
      <div className="flex grid grid-cols-2 gap-4 ">
        <OrderRecent />
        <TableUser />
      </div>

    </>

  )
}

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import AdminShell from "@/components/AdminShell";

export default async function AdminLayout({ children }) {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role === "staff") redirect("/staff");
  return <AdminShell user={user}>{children}</AdminShell>;
}

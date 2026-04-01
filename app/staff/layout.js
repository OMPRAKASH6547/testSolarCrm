import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import StaffShell from "@/components/StaffShell";

export default async function StaffLayout({ children }) {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "staff") redirect("/admin");
  return <StaffShell user={user}>{children}</StaffShell>;
}

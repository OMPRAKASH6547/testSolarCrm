import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";

export default async function HomePage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role === "staff") redirect("/staff");
  redirect("/admin");
}

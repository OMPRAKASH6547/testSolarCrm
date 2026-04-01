import { jsonOk } from "@/lib/api-helpers";

export async function POST() {
  const res = jsonOk({ ok: true });
  res.cookies.set("token", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}

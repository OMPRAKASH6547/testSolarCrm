import { NextResponse } from "next/server";

const csv = [
  [
    "Customer name",
    "Mobile",
    "City",
    "Pincode",
    "Requirement (kW)",
    "Customer type",
    "Other details",
  ].join(","),
  ["John Doe", "9876543210", "Pune", "411001", "5", "Domestic", "No special notes"].join(","),
].join("\n");

export async function GET() {
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="leads-sample.csv"',
    },
  });
}


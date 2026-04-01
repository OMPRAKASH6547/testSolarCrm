import "./globals.css";

export const metadata = {
  title: "SolarPro CRM",
  description: "Solar installation lead management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

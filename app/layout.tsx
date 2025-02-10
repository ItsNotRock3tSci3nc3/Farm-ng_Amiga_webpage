import type { Metadata } from "next";
import "@/styles/globals.css";
import Navbar from "@/components/UI/Navbar";


export const metadata: Metadata = {
  title: "Farm Robot",
  description: "Paalab robotics team website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        <Navbar />
        <main className="p-4">{children}</main>
      </body>
    </html>
  );
}

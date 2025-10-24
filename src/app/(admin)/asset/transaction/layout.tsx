import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bàn giao",
  description: "Quản lý bàn giao tài sản trong hệ thống",
};

export default function HandoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

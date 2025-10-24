import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đơn vị",
  description: "Quản lý đơn vị trong hệ thống",
};

export default function UnitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

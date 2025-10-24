import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kiểm kê",
  description: "Quản lý kỳ kiểm kê trong hệ thống",
};

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

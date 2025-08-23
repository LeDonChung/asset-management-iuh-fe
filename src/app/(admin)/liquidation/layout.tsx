import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý thanh lý tài sản | Asset Management",
  description: "Quản lý đề xuất và phê duyệt thanh lý tài sản",
};

export default function LiquidationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

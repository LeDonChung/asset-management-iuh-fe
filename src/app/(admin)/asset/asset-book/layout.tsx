import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sổ tài sản",
  description: "Quản lý sổ tài sản trong hệ thống",
};

export default function AssetBookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

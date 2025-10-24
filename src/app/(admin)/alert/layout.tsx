import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cảnh báo",
  description: "Quản lý cảnh báo trong hệ thống",
};

export default function AlertLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

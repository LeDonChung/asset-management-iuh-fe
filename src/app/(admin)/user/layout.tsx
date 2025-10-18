import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Người dùng",
  description: "Quản lý người dùng trong hệ thống",
};

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

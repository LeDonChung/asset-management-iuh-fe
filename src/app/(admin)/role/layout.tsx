import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vai trò",
  description: "Quản lý vai trò và quyền hạn trong hệ thống",
};

export default function RoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

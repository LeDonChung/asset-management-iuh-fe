import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Di chuyển",
  description: "Quản lý di chuyển tài sản trong hệ thống",
};

export default function MoveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

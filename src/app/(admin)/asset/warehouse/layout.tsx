import { ReactNode } from 'react';

interface WarehouseLayoutProps {
  children: ReactNode;
}

export default function WarehouseLayout({ children }: WarehouseLayoutProps) {
  return (
    <div className="warehouse-layout">
      {children}
    </div>
  );
}

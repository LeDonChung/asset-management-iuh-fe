import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/common/ProtectedRoute';

export default function DashboardSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'ADMIN', 'PHONG_QUAN_TRI', 'PHONG_KE_HOACH_DAU_TU', 'DON_VI_SU_DUNG']}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

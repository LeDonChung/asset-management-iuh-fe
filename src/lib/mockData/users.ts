import { User, UserStatus, Role } from '@/types/asset';

export const mockRoles: Role[] = [
  { id: 'role-1', name: 'Quản trị viên hệ thống', code: 'ADMIN' },
  { id: 'role-2', name: 'Quản lý tài sản', code: 'ASSET_MANAGER' },
  { id: 'role-3', name: 'Nhân viên đơn vị', code: 'UNIT_USER' },
  { id: 'role-4', name: 'Kế hoạch đầu tư', code: 'PLANNER' },
  { id: 'role-5', name: 'Quản trị', code: 'ADMINISTRATOR' }
];

export const mockUsers: User[] = [
  {
    id: 'user-1',
    username: 'cntt001',
    fullName: 'Nguyễn Văn A',
    email: 'nvana@iuh.edu.vn',
    unitId: '1',
    phoneNumber: '0901234567',
    birthDate: '1985-05-15',
    status: UserStatus.ACTIVE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    roles: [mockRoles[1]] // ASSET_MANAGER
  },
  {
    id: 'user-2',
    username: 'kt001',
    fullName: 'Trần Thị B',
    email: 'tthib@iuh.edu.vn',
    unitId: '2',
    phoneNumber: '0901234568',
    birthDate: '1987-08-20',
    status: UserStatus.ACTIVE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    roles: [mockRoles[1]] // ASSET_MANAGER
  },
  {
    id: 'user-3',
    username: 'ck001',
    fullName: 'Lê Văn C',
    email: 'lvanc@iuh.edu.vn',
    unitId: '3',
    phoneNumber: '0901234569',
    birthDate: '1982-12-10',
    status: UserStatus.ACTIVE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    roles: [mockRoles[1]] // ASSET_MANAGER
  },
  {
    id: 'user-4',
    username: 'khdt001',
    fullName: 'Phạm Thị D',
    email: 'pthid@iuh.edu.vn',
    unitId: '4',
    phoneNumber: '0901234570',
    birthDate: '1980-03-25',
    status: UserStatus.ACTIVE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    roles: [mockRoles[3]] // PLANNER
  },
  {
    id: 'user-5',
    username: 'qt001',
    fullName: 'Hoàng Văn E',
    email: 'hvane@iuh.edu.vn',
    unitId: '5',
    phoneNumber: '0901234571',
    birthDate: '1978-11-05',
    status: UserStatus.ACTIVE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    roles: [mockRoles[4]] // ADMINISTRATOR
  },
  {
    id: 'admin',
    username: 'admin',
    fullName: 'Quản trị hệ thống',
    email: 'admin@iuh.edu.vn',
    phoneNumber: '0901234572',
    birthDate: '1975-01-01',
    status: UserStatus.ACTIVE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    roles: [mockRoles[0]] // ADMIN
  },
  {
    id: 'user-6',
    username: 'qt002',
    fullName: 'Trần Thị Quản trị',
    email: 'ttqt@iuh.edu.vn',
    unitId: '5',
    phoneNumber: '0901234573',
    birthDate: '1983-06-15',
    status: UserStatus.ACTIVE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    roles: [mockRoles[4]] // ADMINISTRATOR
  },
  {
    id: 'user-7',
    username: 'kho001',
    fullName: 'Phạm Thị Kho',
    email: 'ptkho@iuh.edu.vn',
    unitId: '5',
    phoneNumber: '0901234574',
    birthDate: '1988-09-20',
    status: UserStatus.ACTIVE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    roles: [mockRoles[4]] // ADMINISTRATOR
  },
  {
    id: 'user-8',
    username: 'ms001',
    fullName: 'Đặng Văn Mua sắm',
    email: 'dvms@iuh.edu.vn',
    unitId: '5',
    phoneNumber: '0901234575',
    birthDate: '1986-04-10',
    status: UserStatus.ACTIVE,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    roles: [mockRoles[4]] // ADMINISTRATOR
  }
];

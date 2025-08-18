import { Unit, UnitType, UnitStatus } from '@/types/asset';

export const mockUnits: Unit[] = [
  {
    id: '1',
    name: 'Khoa Công nghệ thông tin',
    phone: '0283.8940.390',
    email: 'cntt@iuh.edu.vn',
    type: UnitType.DON_VI_SU_DUNG,
    representativeId: 'user-1',
    status: UnitStatus.ACTIVE,
    createdBy: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Khoa Kinh tế',
    phone: '0283.8940.391',
    email: 'kt@iuh.edu.vn',
    type: UnitType.DON_VI_SU_DUNG,
    representativeId: 'user-2',
    status: UnitStatus.ACTIVE,
    createdBy: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Khoa Cơ khí',
    phone: '0283.8940.392',
    email: 'ck@iuh.edu.vn',
    type: UnitType.DON_VI_SU_DUNG,
    representativeId: 'user-3',
    status: UnitStatus.ACTIVE,
    createdBy: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Phòng Kế hoạch đầu tư',
    phone: '0283.8940.393',
    email: 'khdt@iuh.edu.vn',
    type: UnitType.PHONG_KE_HOACH_DAU_TU,
    representativeId: 'user-4',
    status: UnitStatus.ACTIVE,
    createdBy: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Phòng Quản trị',
    phone: '0283.8940.394',
    email: 'qt@iuh.edu.vn',
    type: UnitType.PHONG_QUAN_TRI,
    representativeId: 'user-5',
    status: UnitStatus.ACTIVE,
    createdBy: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

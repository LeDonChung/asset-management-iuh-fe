import { Category } from '@/types/asset';

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Thiết bị điện tử',
    code: 'THIET_BI_DIEN_TU'
  },
  {
    id: '2',
    name: 'Nội thất',
    code: 'NOI_THAT'
  },
  {
    id: '3',
    name: 'Thiết bị văn phòng',
    code: 'THIET_BI_VAN_PHONG'
  },
  {
    id: '4',
    name: 'Máy tính',
    code: 'MAY_TINH',
    parentId: '1'
  },
  {
    id: '5',
    name: 'Máy in',
    code: 'MAY_IN',
    parentId: '1'
  },
  {
    id: '6',
    name: 'Máy chiếu',
    code: 'MAY_CHIEU',
    parentId: '1'
  },
  {
    id: '7',
    name: 'Bàn ghế',
    code: 'BAN_GHE',
    parentId: '2'
  },
  {
    id: '8',
    name: 'Tủ kệ',
    code: 'TU_KE',
    parentId: '2'
  },
  {
    id: '9',
    name: 'Điều hòa',
    code: 'DIEU_HOA',
    parentId: '1'
  },
  {
    id: '10',
    name: 'Máy photocopy',
    code: 'MAY_PHOTOCOPY',
    parentId: '3'
  }
];

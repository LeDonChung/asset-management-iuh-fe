import { Room, RoomStatus } from '@/types/asset';

export const mockRooms: Room[] = [
  // Khoa Công nghệ thông tin - Tòa 1
  {
    id: '1H2.01',
    building: 'Tòa 1',
    floor: 'Lầu 2',
    roomNumber: '1H2.01',
    status: RoomStatus.ACTIVE,
    unitId: '1'
  },
  {
    id: '1H2.02',
    building: 'Tòa 1',
    floor: 'Lầu 2',
    roomNumber: '1H2.02',
    status: RoomStatus.ACTIVE,
    unitId: '1'
  },
  {
    id: '1H2.03',
    building: 'Tòa 1',
    floor: 'Lầu 2',
    roomNumber: '1H2.03',
    status: RoomStatus.ACTIVE,
    unitId: '1'
  },
  {
    id: '1H3.01',
    building: 'Tòa 1',
    floor: 'Lầu 3',
    roomNumber: '1H3.01',
    status: RoomStatus.ACTIVE,
    unitId: '1'
  },
  {
    id: '1H3.02',
    building: 'Tòa 1',
    floor: 'Lầu 3',
    roomNumber: '1H3.02',
    status: RoomStatus.ACTIVE,
    unitId: '1'
  },

  // Khoa Kinh tế - Tòa 2
  {
    id: '2H1.01',
    building: 'Tòa 2',
    floor: 'Lầu 1',
    roomNumber: '2H1.01',
    status: RoomStatus.ACTIVE,
    unitId: '2'
  },
  {
    id: '2H1.02',
    building: 'Tòa 2',
    floor: 'Lầu 1',
    roomNumber: '2H1.02',
    status: RoomStatus.ACTIVE,
    unitId: '2'
  },
  {
    id: '2H2.01',
    building: 'Tòa 2',
    floor: 'Lầu 2',
    roomNumber: '2H2.01',
    status: RoomStatus.ACTIVE,
    unitId: '2'
  },
  {
    id: '2H2.02',
    building: 'Tòa 2',
    floor: 'Lầu 2',
    roomNumber: '2H2.02',
    status: RoomStatus.ACTIVE,
    unitId: '2'
  },

  // Khoa Cơ khí - Tòa 3
  {
    id: '3H1.01',
    building: 'Tòa 3',
    floor: 'Lầu 1',
    roomNumber: '3H1.01',
    status: RoomStatus.ACTIVE,
    unitId: '3'
  },
  {
    id: '3H1.02',
    building: 'Tòa 3',
    floor: 'Lầu 1',
    roomNumber: '3H1.02',
    status: RoomStatus.ACTIVE,
    unitId: '3'
  },
  {
    id: '3H2.01',
    building: 'Tòa 3',
    floor: 'Lầu 2',
    roomNumber: '3H2.01',
    status: RoomStatus.ACTIVE,
    unitId: '3'
  },

  // Phòng Kế hoạch đầu tư - Tòa A (Hành chính)
  {
    id: 'A1.01',
    building: 'Tòa A',
    floor: 'Lầu 1',
    roomNumber: 'A1.01',
    status: RoomStatus.ACTIVE,
    unitId: '4'
  },
  {
    id: 'A1.02',
    building: 'Tòa A',
    floor: 'Lầu 1',
    roomNumber: 'A1.02',
    status: RoomStatus.ACTIVE,
    unitId: '4'
  },

  // Phòng Quản trị - Tòa A (Hành chính)
  {
    id: 'A2.01',
    building: 'Tòa A',
    floor: 'Lầu 2',
    roomNumber: 'A2.01',
    status: RoomStatus.ACTIVE,
    unitId: '5'
  },
  {
    id: 'A2.02',
    building: 'Tòa A',
    floor: 'Lầu 2',
    roomNumber: 'A2.02',
    status: RoomStatus.ACTIVE,
    unitId: '5'
  }
];

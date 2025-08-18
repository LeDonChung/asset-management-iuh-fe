import { AssetLog, AssetLogStatus } from '@/types/asset';

export const mockAssetLogs: AssetLog[] = [
  // Logs for Laptop Dell Inspiron 15 (ASSET-001)
  {
    id: 'LOG-001',
    assetId: 'ASSET-001',
    action: 'Tạo mới tài sản',
    reason: 'Nhập thiết bị mới từ nhà cung cấp',
    status: AssetLogStatus.COMPLETED,
    createdAt: '2024-01-15T08:00:00.000Z',
    createdBy: 'Nguyễn Văn An'
  },
  {
    id: 'LOG-002',
    assetId: 'ASSET-001',
    action: 'Kiểm tra định kỳ',
    reason: 'Kiểm tra tình trạng hoạt động',
    status: AssetLogStatus.COMPLETED,
    createdAt: '2024-02-15T10:30:00.000Z',
    createdBy: 'Trần Thị Bình'
  },
  {
    id: 'LOG-003',
    assetId: 'ASSET-001',
    action: 'Bàn giao tài sản',
    reason: 'Bàn giao cho phòng IT',
    status: AssetLogStatus.COMPLETED,
    fromLocation: 'Kho',
    toLocation: 'Phòng 1H2.02',
    createdAt: '2024-03-01T14:00:00.000Z',
    createdBy: 'Phạm Văn Cường'
  },

  // Logs for Máy chiếu Epson (ASSET-002)
  {
    id: 'LOG-004',
    assetId: 'ASSET-002',
    action: 'Tạo mới tài sản',
    reason: 'Nhập thiết bị mới từ nhà cung cấp',
    status: AssetLogStatus.COMPLETED,
    createdAt: '2024-01-20T09:00:00.000Z',
    createdBy: 'Lê Thị Dung'
  },
  {
    id: 'LOG-005',
    assetId: 'ASSET-002',
    action: 'Bàn giao tài sản',
    reason: 'Bàn giao cho phòng học',
    status: AssetLogStatus.COMPLETED,
    fromLocation: 'Kho',
    toLocation: 'Phòng 1H3.01',
    createdAt: '2024-01-25T11:00:00.000Z',
    createdBy: 'Hoàng Văn Em'
  },
  {
    id: 'LOG-006',
    assetId: 'ASSET-002',
    action: 'Bảo trì định kỳ',
    reason: 'Vệ sinh và kiểm tra lens',
    status: AssetLogStatus.IN_PROGRESS,
    createdAt: '2024-03-20T08:00:00.000Z',
    createdBy: 'Vũ Thị Giang'
  },

  // Logs for Bàn làm việc (ASSET-003)
  {
    id: 'LOG-007',
    assetId: 'ASSET-003',
    action: 'Tạo mới tài sản',
    reason: 'Nhập nội thất mới',
    status: AssetLogStatus.COMPLETED,
    createdAt: '2024-02-01T10:00:00.000Z',
    createdBy: 'Đỗ Văn Hùng'
  },
  {
    id: 'LOG-008',
    assetId: 'ASSET-003',
    action: 'Di chuyển tài sản',
    reason: 'Sắp xếp lại bố cục phòng',
    status: AssetLogStatus.COMPLETED,
    fromLocation: 'Phòng 1H2.01',
    toLocation: 'Phòng 1H2.03',
    createdAt: '2024-02-10T14:30:00.000Z',
    createdBy: 'Bùi Thị Lan'
  },

  // Logs for Ghế văn phòng (ASSET-004)
  {
    id: 'LOG-009',
    assetId: 'ASSET-004',
    action: 'Tạo mới tài sản',
    reason: 'Nhập nội thất mới',
    status: AssetLogStatus.COMPLETED,
    createdAt: '2024-02-01T10:30:00.000Z',
    createdBy: 'Đỗ Văn Hùng'
  },
  {
    id: 'LOG-010',
    assetId: 'ASSET-004',
    action: 'Sửa chữa',
    reason: 'Thay thế bánh xe bị hỏng',
    status: AssetLogStatus.COMPLETED,
    createdAt: '2024-02-20T16:00:00.000Z',
    createdBy: 'Nguyễn Thành Nam'
  },

  // Logs for Máy tính bảng iPad (ASSET-005)
  {
    id: 'LOG-011',
    assetId: 'ASSET-005',
    action: 'Tạo mới tài sản',
    reason: 'Nhập thiết bị giảng dạy',
    status: AssetLogStatus.COMPLETED,
    createdAt: '2024-01-10T09:30:00.000Z',
    createdBy: 'Trần Văn Phú'
  },
  {
    id: 'LOG-012',
    assetId: 'ASSET-005',
    action: 'Cập nhật phần mềm',
    reason: 'Nâng cấp hệ điều hành',
    status: AssetLogStatus.COMPLETED,
    createdAt: '2024-02-25T13:00:00.000Z',
    createdBy: 'Lê Thị Quỳnh'
  },

  // Logs for Tủ tài liệu (ASSET-006)
  {
    id: 'LOG-013',
    assetId: 'ASSET-006',
    action: 'Tạo mới tài sản',
    reason: 'Nhập nội thất văn phòng',
    status: AssetLogStatus.COMPLETED,
    createdAt: '2024-01-05T08:30:00.000Z',
    createdBy: 'Phạm Thị Sơn'
  },

  // Logs for Máy in Canon (ASSET-007)
  {
    id: 'LOG-014',
    assetId: 'ASSET-007',
    action: 'Tạo mới tài sản',
    reason: 'Nhập thiết bị văn phòng',
    status: AssetLogStatus.COMPLETED,
    createdAt: '2024-01-30T11:00:00.000Z',
    createdBy: 'Võ Văn Tùng'
  },
  {
    id: 'LOG-015',
    assetId: 'ASSET-007',
    action: 'Thay thế mực in',
    reason: 'Bảo trì định kỳ',
    status: AssetLogStatus.COMPLETED,
    createdAt: '2024-03-15T14:00:00.000Z',
    createdBy: 'Đặng Thị Uyên'
  },

  // Logs for Điều hòa Daikin (ASSET-008)
  {
    id: 'LOG-016',
    assetId: 'ASSET-008',
    action: 'Tạo mới tài sản',
    reason: 'Lắp đặt hệ thống làm mát',
    status: AssetLogStatus.COMPLETED,
    createdAt: '2024-02-15T07:00:00.000Z',
    createdBy: 'Nguyễn Văn Vượng'
  },
  {
    id: 'LOG-017',
    assetId: 'ASSET-008',
    action: 'Bảo trì hệ thống',
    reason: 'Vệ sinh và kiểm tra gas',
    status: AssetLogStatus.PENDING,
    createdAt: '2024-03-25T08:00:00.000Z',
    createdBy: 'Lý Thị Xuân'
  },

  // Logs for Máy tính để bàn HP (ASSET-009) - có thay đổi vị trí
  {
    id: 'LOG-018',
    assetId: 'asset-009',
    action: 'Tạo mới tài sản',
    reason: 'Nhập thiết bị mới từ nhà cung cấp',
    status: AssetLogStatus.COMPLETED,
    createdAt: '2024-08-10T09:00:00.000Z',
    createdBy: 'Nguyễn Văn An'
  },
  {
    id: 'LOG-019',
    assetId: 'asset-009',
    action: 'Bàn giao tài sản',
    reason: 'Bàn giao theo kế hoạch',
    status: AssetLogStatus.COMPLETED,
    fromLocation: 'Kho',
    toLocation: 'Phòng 1H2.02',
    createdAt: '2024-08-15T10:00:00.000Z',
    createdBy: 'Phạm Văn Cường'
  },
  {
    id: 'LOG-020',
    assetId: 'asset-009',
    action: 'Di chuyển tài sản',
    reason: 'Thay đổi vị trí sử dụng theo yêu cầu',
    status: AssetLogStatus.COMPLETED,
    fromLocation: 'Phòng 1H2.02',
    toLocation: 'Phòng 1H2.03',
    createdAt: '2024-08-16T14:00:00.000Z',
    createdBy: 'Trần Thị Bình'
  },

  // Logs for Máy chiếu BenQ (ASSET-010) - có kế hoạch nhưng chưa bàn giao
  {
    id: 'LOG-021',
    assetId: 'asset-010',
    action: 'Tạo mới tài sản',
    reason: 'Nhập thiết bị chiếu từ nhà cung cấp',
    status: AssetLogStatus.COMPLETED,
    createdAt: '2024-08-12T08:30:00.000Z',
    createdBy: 'Lê Văn Minh'
  },
  {
    id: 'LOG-022',
    assetId: 'asset-010',
    action: 'Lập kế hoạch phân bổ',
    reason: 'Dự kiến bàn giao cho Khoa Kinh tế',
    status: AssetLogStatus.PENDING,
    toLocation: 'Phòng 2H1.02',
    createdAt: '2024-08-12T14:00:00.000Z',
    createdBy: 'Trần Thị Quản trị'
  },

  // Logs for Bộ bàn ghế họp (ASSET-011) - chưa có kế hoạch
  {
    id: 'LOG-023',
    assetId: 'asset-011',
    action: 'Tạo mới tài sản',
    reason: 'Nhập nội thất văn phòng mới',
    status: AssetLogStatus.COMPLETED,
    createdAt: '2024-08-14T09:15:00.000Z',
    createdBy: 'Phạm Thị Kho'
  },
  {
    id: 'LOG-024',
    assetId: 'asset-011',
    action: 'Kiểm tra chất lượng',
    reason: 'Kiểm tra tình trạng sau khi nhập kho',
    status: AssetLogStatus.COMPLETED,
    createdAt: '2024-08-14T15:30:00.000Z',
    createdBy: 'Nguyễn Văn Kiểm'
  },

  // Logs for Máy lạnh Panasonic (ASSET-012) - có kế hoạch chờ bàn giao
  {
    id: 'LOG-025',
    assetId: 'asset-012',
    action: 'Tạo mới tài sản',
    reason: 'Nhập thiết bị điều hòa mới',
    status: AssetLogStatus.COMPLETED,
    createdAt: '2024-08-16T07:45:00.000Z',
    createdBy: 'Võ Thị Nhập'
  },
  {
    id: 'LOG-026',
    assetId: 'asset-012',
    action: 'Lập kế hoạch lắp đặt',
    reason: 'Chuẩn bị lắp đặt cho Khoa Cơ khí',
    status: AssetLogStatus.IN_PROGRESS,
    toLocation: 'Phòng 3H1.02',
    createdAt: '2024-08-16T13:20:00.000Z',
    createdBy: 'Lê Văn Lắp đặt'
  },

  // Logs for Laptop ASUS (ASSET-013) - chưa phân bổ
  {
    id: 'LOG-027',
    assetId: 'asset-013',
    action: 'Tạo mới tài sản',
    reason: 'Nhập laptop cho nhu cầu di động',
    status: AssetLogStatus.COMPLETED,
    createdAt: '2024-08-17T10:00:00.000Z',
    createdBy: 'Đặng Văn Mua sắm'
  },
  {
    id: 'LOG-028',
    assetId: 'asset-013',
    action: 'Cài đặt phần mềm',
    reason: 'Cài đặt hệ điều hành và ứng dụng cơ bản',
    status: AssetLogStatus.IN_PROGRESS,
    createdAt: '2024-08-17T16:30:00.000Z',
    createdBy: 'Trần Thị IT'
  }
];

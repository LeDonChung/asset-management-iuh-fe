import { 
  LiquidationProposal, 
  LiquidationProposalItem, 
  LiquidationStatus, 
  LiquidationProposalItemCondition 
} from '@/types/asset';

export const mockLiquidationProposals: LiquidationProposal[] = [
  {
    id: "LIQ-2025-001",
    proposerId: "user-3", // Đại diện đơn vị sử dụng
    unitId: "3", // Khoa Công nghệ Thông tin
    reason: "Tài sản hư hỏng không thể sửa chữa, cần thanh lý để tiết kiệm chi phí bảo trì",
    status: LiquidationStatus.PROPOSED,
    createdAt: "2025-01-15T08:30:00Z",
    updatedAt: "2025-01-15T08:30:00Z"
  },
  {
    id: "LIQ-2025-002", 
    proposerId: "user-5",
    unitId: "4", // Khoa Cơ khí
    reason: "Thiết bị lỗi thời, không còn phù hợp với yêu cầu giảng dạy hiện tại",
    status: LiquidationStatus.APPROVED,
    createdAt: "2025-01-10T14:20:00Z",
    updatedAt: "2025-01-12T10:15:00Z"
  },
  {
    id: "LIQ-2025-003",
    proposerId: "user-7",
    unitId: "5", // Khoa Kinh tế
    reason: "Máy tính cũ không đáp ứng được phần mềm mới, cần thay thế",
    status: LiquidationStatus.REJECTED,
    createdAt: "2025-01-08T09:45:00Z", 
    updatedAt: "2025-01-09T16:30:00Z"
  },
  {
    id: "LIQ-2025-004",
    proposerId: "user-3",
    unitId: "3",
    reason: "Tài sản bị hỏng do sự cố cháy nổ, không thể phục hồi",
    status: LiquidationStatus.PROPOSED,
    createdAt: "2025-01-18T11:00:00Z",
    updatedAt: "2025-01-18T11:00:00Z"
  },
  {
    id: "LIQ-2025-005",
    proposerId: "user-4",
    unitId: "2", // Khoa Ngoại ngữ
    reason: "Thiết bị âm thanh cũ, chất lượng kém, ảnh hưởng đến chất lượng giảng dạy",
    status: LiquidationStatus.APPROVED,
    createdAt: "2025-01-05T13:15:00Z",
    updatedAt: "2025-01-07T09:20:00Z"
  },
  {
    id: "LIQ-2025-006",
    proposerId: "user-4",
    unitId: "4", // Khoa Cơ khí
    reason: "Máy công cụ đã sử dụng quá 15 năm, độ chính xác không đảm bảo tiêu chuẩn an toàn",
    status: LiquidationStatus.PROPOSED,
    createdAt: "2025-01-20T16:45:00Z",
    updatedAt: "2025-01-20T16:45:00Z"
  },
  {
    id: "LIQ-2025-007",
    proposerId: "user-6",
    unitId: "5", // Khoa Kinh tế
    reason: "Máy chiếu cũ không hỗ trợ độ phân giải HD, ảnh hưởng chất lượng giảng dạy",
    status: LiquidationStatus.APPROVED,
    createdAt: "2025-01-12T11:30:00Z",
    updatedAt: "2025-01-14T09:20:00Z"
  },
  {
    id: "LIQ-2025-008",
    proposerId: "user-8",
    unitId: "1", // Khoa Ngoại ngữ
    reason: "Hệ thống lab ngôn ngữ bị lỗi nghiêm trọng, không thể khôi phục",
    status: LiquidationStatus.REJECTED,
    createdAt: "2025-01-03T14:15:00Z",
    updatedAt: "2025-01-05T08:30:00Z"
  },
  {
    id: "LIQ-2025-009",
    proposerId: "user-4",
    unitId: "3", // Khoa Y
    reason: "Thiết bị y tế cũ không đạt tiêu chuẩn mới, cần thay thế ngay",
    status: LiquidationStatus.PROPOSED,
    createdAt: "2025-01-22T10:15:00Z",
    updatedAt: "2025-01-22T10:15:00Z"
  },
  {
    id: "LIQ-2025-010",
    proposerId: "user-1",
    unitId: "4", // Khoa Luật
    reason: "Máy in cũ thường xuyên kẹt giấy, chi phí sửa chữa cao hơn mua mới",
    status: LiquidationStatus.APPROVED,
    createdAt: "2025-01-01T09:00:00Z",
    updatedAt: "2025-01-03T15:45:00Z"
  },
  {
    id: "LIQ-2025-011",
    proposerId: "user-3",
    unitId: "3", // Khoa Công nghệ Thông tin
    reason: "Server cũ không hỗ trợ hệ điều hành mới, gây rủi ro bảo mật",
    status: LiquidationStatus.PROPOSED,
    createdAt: "2025-01-25T13:20:00Z",
    updatedAt: "2025-01-25T13:20:00Z"
  },
  {
    id: "LIQ-2025-012",
    proposerId: "user-5",
    unitId: "3", // Khoa Môi trường
    reason: "Thiết bị đo lường môi trường hết hạn hiệu chuẩn, không thể sử dụng",
    status: LiquidationStatus.REJECTED,
    createdAt: "2024-12-28T16:30:00Z",
    updatedAt: "2024-12-30T11:15:00Z"
  },
  {
    id: "LIQ-2025-013",
    proposerId: "user-6",
    unitId: "4", // Khoa Điện - Điện tử
    reason: "Oscilloscope analog cũ, không còn phù hợp với chương trình đào tạo hiện đại",
    status: LiquidationStatus.APPROVED,
    createdAt: "2024-12-25T08:45:00Z",
    updatedAt: "2024-12-27T14:20:00Z"
  },
  {
    id: "LIQ-2025-014",
    proposerId: "user-8",
    unitId: "5", // Khoa Hóa học
    reason: "Tủ hút khí độc bị rò rỉ, gây nguy hiểm cho người sử dụng",
    status: LiquidationStatus.PROPOSED,
    createdAt: "2025-01-28T07:30:00Z",
    updatedAt: "2025-01-28T07:30:00Z"
  },
  {
    id: "LIQ-2025-015",
    proposerId: "user-2",
    unitId: "3", // Khoa Toán - Tin
    reason: "Cluster tính toán cũ, hiệu năng thấp, tiêu thụ điện năng cao",
    status: LiquidationStatus.PROPOSED,
    createdAt: "2025-01-30T12:00:00Z",
    updatedAt: "2025-01-30T12:00:00Z"
  },
  {
    id: "LIQ-2024-050",
    proposerId: "user-5",
    unitId: "4", // Khoa Cơ khí
    reason: "Máy tiện CNC đã hỏng động cơ chính, chi phí sửa chữa quá cao",
    status: LiquidationStatus.APPROVED,
    createdAt: "2024-12-15T11:20:00Z",
    updatedAt: "2024-12-18T09:30:00Z"
  },
  {
    id: "LIQ-2024-051",
    proposerId: "user-2",
    unitId: "3", // Phòng Hành chính
    reason: "Hệ thống máy lạnh trung tâm cũ, thường xuyên hỏng hóc",
    status: LiquidationStatus.REJECTED,
    createdAt: "2024-12-10T15:45:00Z",
    updatedAt: "2024-12-12T10:15:00Z"
  },
  {
    id: "LIQ-2024-052",
    proposerId: "user-7",
    unitId: "4", // Thư viện
    reason: "Hệ thống quản lý sách cũ không tương thích với phần mềm mới",
    status: LiquidationStatus.APPROVED,
    createdAt: "2024-12-05T14:30:00Z",
    updatedAt: "2024-12-08T16:45:00Z"
  },
  {
    id: "LIQ-2024-053",
    proposerId: "user-8",
    unitId: "5", // Phòng Đào tạo
    reason: "Bảng tương tác cũ không nhận diện chính xác, gây khó khăn trong giảng dạy",
    status: LiquidationStatus.PROPOSED,
    createdAt: "2025-02-01T08:15:00Z",
    updatedAt: "2025-02-01T08:15:00Z"
  },
  {
    id: "LIQ-2024-054",
    proposerId: "user-7",
    unitId: "2", // Phòng Kế toán
    reason: "Máy tính kế toán chuyên dùng đã quá cũ, không hỗ trợ phần mềm kế toán mới",
    status: LiquidationStatus.APPROVED,
    createdAt: "2024-11-28T13:40:00Z",
    updatedAt: "2024-12-01T11:25:00Z"
  }
];

export const mockLiquidationProposalItems: LiquidationProposalItem[] = [
  // Items cho proposal LIQ-2025-001
  {
    id: "liq-item-001",
    proposalId: "LIQ-2025-001",
    assetId: "asset-001", // Máy tính Dell Inspiron
    reason: "Mainboard bị cháy, không thể khởi động. Chi phí sửa chữa cao hơn giá trị còn lại",
    condition: LiquidationProposalItemCondition.DAMAGED,
    mediaUrl: "/images/evidence/laptop-burned-001.jpg"
  },
  {
    id: "liq-item-002", 
    proposalId: "LIQ-2025-001",
    assetId: "asset-015", // Máy chiếu Epson
    reason: "Bóng đèn hỏng, không còn phụ tùng thay thế trên thị trường",
    condition: LiquidationProposalItemCondition.UNUSABLE,
    mediaUrl: "/images/evidence/projector-broken-001.jpg"
  },
  {
    id: "liq-item-003",
    proposalId: "LIQ-2025-001",
    assetId: "asset-032", // UPS APC
    reason: "Pin đã phồng, có nguy cơ cháy nổ, không an toàn",
    condition: LiquidationProposalItemCondition.DAMAGED,
    mediaUrl: "/images/evidence/ups-battery-001.jpg"
  },
  
  // Items cho proposal LIQ-2025-002
  {
    id: "liq-item-004",
    proposalId: "LIQ-2025-002", 
    assetId: "asset-025", // Máy khoan cũ
    reason: "Thiết bị quá cũ, không đạt tiêu chuẩn an toàn hiện tại",
    condition: LiquidationProposalItemCondition.UNUSABLE,
    mediaUrl: "/images/evidence/drill-old-001.jpg"
  },
  {
    id: "liq-item-005",
    proposalId: "LIQ-2025-002",
    assetId: "asset-026", // Máy tiện cũ
    reason: "Độ chính xác không còn đảm bảo, ảnh hưởng đến chất lượng đào tạo",
    condition: LiquidationProposalItemCondition.UNUSABLE,
    mediaUrl: "/images/evidence/lathe-old-001.jpg"
  },
  {
    id: "liq-item-006",
    proposalId: "LIQ-2025-002",
    assetId: "asset-027", // Máy phay CNC
    reason: "Hệ thống điều khiển số đã lỗi thời, không tìm được phụ tùng",
    condition: LiquidationProposalItemCondition.DAMAGED,
    mediaUrl: "/images/evidence/cnc-mill-001.jpg"
  },
  
  // Items cho proposal LIQ-2025-003 (đã bị từ chối)
  {
    id: "liq-item-007",
    proposalId: "LIQ-2025-003",
    assetId: "asset-035", // Máy tính văn phòng
    reason: "Chạy chậm, không cài được phần mềm mới",
    condition: LiquidationProposalItemCondition.UNUSABLE,
    mediaUrl: "/images/evidence/pc-slow-001.jpg"
  },
  
  // Items cho proposal LIQ-2025-004
  {
    id: "liq-item-008",
    proposalId: "LIQ-2025-004",
    assetId: "asset-045", // Server Dell
    reason: "Bị cháy do sự cố điện, toàn bộ linh kiện hư hỏng",
    condition: LiquidationProposalItemCondition.DAMAGED,
    mediaUrl: "/images/evidence/server-fire-001.jpg"
  },
  {
    id: "liq-item-009",
    proposalId: "LIQ-2025-004", 
    assetId: "asset-046", // Switch mạng
    reason: "Bị hư hại do sự cố cháy nổ, không thể sử dụng",
    condition: LiquidationProposalItemCondition.DAMAGED,
    mediaUrl: "/images/evidence/switch-fire-001.jpg"
  },
  {
    id: "liq-item-010",
    proposalId: "LIQ-2025-004",
    assetId: "asset-047", // Router Cisco
    reason: "Hư hỏng nặng do cháy, không thể khôi phục",
    condition: LiquidationProposalItemCondition.DAMAGED,
    mediaUrl: "/images/evidence/router-fire-001.jpg"
  },
  
  // Items cho proposal LIQ-2025-005
  {
    id: "liq-item-011",
    proposalId: "LIQ-2025-005",
    assetId: "asset-055", // Loa âm thanh cũ
    reason: "Chất lượng âm thanh kém, có tạp âm, không phù hợp giảng dạy",
    condition: LiquidationProposalItemCondition.UNUSABLE,
    mediaUrl: "/images/evidence/speaker-poor-001.jpg"
  },
  {
    id: "liq-item-012",
    proposalId: "LIQ-2025-005",
    assetId: "asset-056", // Micro cũ
    reason: "Micro bị nhiễu, không thu âm rõ ràng",
    condition: LiquidationProposalItemCondition.DAMAGED,
    mediaUrl: "/images/evidence/mic-noise-001.jpg"
  },

  // Items cho proposal LIQ-2025-006
  {
    id: "liq-item-013",
    proposalId: "LIQ-2025-006",
    assetId: "asset-065", // Máy hàn cũ
    reason: "Máy hàn đã sử dụng 18 năm, không đảm bảo an toàn lao động",
    condition: LiquidationProposalItemCondition.UNUSABLE,
    mediaUrl: "/images/evidence/welding-machine-001.jpg"
  },
  {
    id: "liq-item-014",
    proposalId: "LIQ-2025-006",
    assetId: "asset-066", // Máy cắt plasma
    reason: "Hệ thống khí nén bị rò, có nguy cơ tai nạn lao động",
    condition: LiquidationProposalItemCondition.DAMAGED,
    mediaUrl: "/images/evidence/plasma-cutter-001.jpg"
  },

  // Items cho proposal LIQ-2025-007
  {
    id: "liq-item-015",
    proposalId: "LIQ-2025-007",
    assetId: "asset-075", // Máy chiếu Sony cũ
    reason: "Độ phân giải thấp, không hỗ trợ HDMI, ảnh hưởng chất lượng giảng dạy",
    condition: LiquidationProposalItemCondition.UNUSABLE,
    mediaUrl: "/images/evidence/old-projector-001.jpg"
  },
  {
    id: "liq-item-016",
    proposalId: "LIQ-2025-007",
    assetId: "asset-076", // Màn chiếu cũ
    reason: "Bề mặt màn chiếu đã ố vàng, không thể vệ sinh sạch",
    condition: LiquidationProposalItemCondition.UNUSABLE,
    mediaUrl: "/images/evidence/screen-yellow-001.jpg"
  },

  // Items cho proposal LIQ-2025-009
  {
    id: "liq-item-017",
    proposalId: "LIQ-2025-009",
    assetId: "asset-085", // Máy X-quang cũ
    reason: "Thiết bị không đạt tiêu chuẩn an toàn phóng xạ mới",
    condition: LiquidationProposalItemCondition.UNUSABLE,
    mediaUrl: "/images/evidence/xray-machine-001.jpg"
  },
  {
    id: "liq-item-018",
    proposalId: "LIQ-2025-009",
    assetId: "asset-086", // Máy siêu âm cũ
    reason: "Độ phân giải thấp, không đáp ứng yêu cầu chẩn đoán hiện đại",
    condition: LiquidationProposalItemCondition.UNUSABLE,
    mediaUrl: "/images/evidence/ultrasound-001.jpg"
  },

  // Items cho proposal LIQ-2025-011
  {
    id: "liq-item-019",
    proposalId: "LIQ-2025-011",
    assetId: "asset-095", // Server HP cũ
    reason: "Không hỗ trợ hệ điều hành mới, có lỗ hổng bảo mật nghiêm trọng",
    condition: LiquidationProposalItemCondition.UNUSABLE,
    mediaUrl: "/images/evidence/old-server-001.jpg"
  },
  {
    id: "liq-item-020",
    proposalId: "LIQ-2025-011",
    assetId: "asset-096", // Storage array cũ
    reason: "Ổ cứng thường xuyên lỗi, nguy cơ mất dữ liệu cao",
    condition: LiquidationProposalItemCondition.DAMAGED,
    mediaUrl: "/images/evidence/storage-failure-001.jpg"
  },

  // Items cho proposal LIQ-2025-014
  {
    id: "liq-item-021",
    proposalId: "LIQ-2025-014",
    assetId: "asset-105", // Tủ hút khí độc
    reason: "Hệ thống lọc khí bị rò rỉ, gây nguy hiểm cho sức khỏe",
    condition: LiquidationProposalItemCondition.DAMAGED,
    mediaUrl: "/images/evidence/fume-hood-leak-001.jpg"
  },
  {
    id: "liq-item-022",
    proposalId: "LIQ-2025-014",
    assetId: "asset-106", // Máy ly tâm cũ
    reason: "Vòng bi đã hỏng, gây rung lắc mạnh, không an toàn",
    condition: LiquidationProposalItemCondition.DAMAGED,
    mediaUrl: "/images/evidence/centrifuge-bearing-001.jpg"
  },

  // Items cho proposal LIQ-2025-015
  {
    id: "liq-item-023",
    proposalId: "LIQ-2025-015",
    assetId: "asset-115", // Cluster tính toán cũ
    reason: "CPU thế hệ cũ, hiệu năng thấp, tiêu thụ điện cao",
    condition: LiquidationProposalItemCondition.UNUSABLE,
    mediaUrl: "/images/evidence/old-cluster-001.jpg"
  },
  {
    id: "liq-item-024",
    proposalId: "LIQ-2025-015",
    assetId: "asset-116", // UPS cho cluster
    reason: "Pin đã hết tuổi thọ, không đảm bảo nguồn dự phòng",
    condition: LiquidationProposalItemCondition.DAMAGED,
    mediaUrl: "/images/evidence/cluster-ups-001.jpg"
  },

  // Items cho proposal LIQ-2024-053
  {
    id: "liq-item-025",
    proposalId: "LIQ-2024-053",
    assetId: "asset-125", // Bảng tương tác Smart Board
    reason: "Cảm ứng không chính xác, thường xuyên bị treo, gây gián đoạn giảng dạy",
    condition: LiquidationProposalItemCondition.DAMAGED,
    mediaUrl: "/images/evidence/smartboard-touch-001.jpg"
  },
  {
    id: "liq-item-026",
    proposalId: "LIQ-2024-053",
    assetId: "asset-126", // Máy tính điều khiển bảng
    reason: "Cấu hình thấp, không chạy được phần mềm tương tác mới",
    condition: LiquidationProposalItemCondition.UNUSABLE,
    mediaUrl: "/images/evidence/board-pc-001.jpg"
  }
];

// Helper function để lấy items theo proposal
export const getLiquidationItemsByProposal = (proposalId: string): LiquidationProposalItem[] => {
  return mockLiquidationProposalItems.filter(item => item.proposalId === proposalId);
};

// Helper function để lấy proposal với đầy đủ thông tin
export const getLiquidationProposalWithItems = (proposalId: string): LiquidationProposal | null => {
  const proposal = mockLiquidationProposals.find(p => p.id === proposalId);
  if (!proposal) return null;
  
  return {
    ...proposal,
    items: getLiquidationItemsByProposal(proposalId)
  };
};

// Helper function để thống kê
export const getLiquidationStats = () => {
  const total = mockLiquidationProposals.length;
  const proposed = mockLiquidationProposals.filter(p => p.status === LiquidationStatus.PROPOSED).length;
  const approved = mockLiquidationProposals.filter(p => p.status === LiquidationStatus.APPROVED).length;
  const rejected = mockLiquidationProposals.filter(p => p.status === LiquidationStatus.REJECTED).length;
  
  return { total, proposed, approved, rejected };
};

// Helper function để lấy đề xuất theo đơn vị
export const getLiquidationProposalsByUnit = (unitId: string): LiquidationProposal[] => {
  return mockLiquidationProposals.filter(p => p.unitId === unitId);
};

// Helper function để lấy đề xuất theo người đề xuất
export const getLiquidationProposalsByProposer = (proposerId: string): LiquidationProposal[] => {
  return mockLiquidationProposals.filter(p => p.proposerId === proposerId);
};

// Helper function để lấy đề xuất theo trạng thái
export const getLiquidationProposalsByStatus = (status: LiquidationStatus): LiquidationProposal[] => {
  return mockLiquidationProposals.filter(p => p.status === status);
};

// Helper function để lấy đề xuất trong khoảng thời gian
export const getLiquidationProposalsByDateRange = (startDate: string, endDate: string): LiquidationProposal[] => {
  return mockLiquidationProposals.filter(p => {
    const createdDate = new Date(p.createdAt);
    return createdDate >= new Date(startDate) && createdDate <= new Date(endDate);
  });
};

// Helper function để tìm kiếm đề xuất
export const searchLiquidationProposals = (searchTerm: string): LiquidationProposal[] => {
  const term = searchTerm.toLowerCase();
  return mockLiquidationProposals.filter(p => 
    p.id.toLowerCase().includes(term) ||
    p.reason.toLowerCase().includes(term)
  );
};

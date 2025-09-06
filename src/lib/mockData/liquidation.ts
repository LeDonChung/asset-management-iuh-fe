import { 
  LiquidationProposal, 
  LiquidationProposalItem, 
  LiquidationStatus, 
  LiquidationProposalItemCondition,
  AssetType
} from '@/types/asset';

export const mockLiquidationProposals: LiquidationProposal[] = [
  {
    id: "LIQ-2025-001",
    proposerId: "user-3",
    unitId: "3", 
    typeAsset: AssetType.TSCD,
    reason: "Tài sản hư hỏng không thể sửa chữa, cần thanh lý để tiết kiệm chi phí bảo trì",
    status: LiquidationStatus.PROPOSED,
    createdAt: "2025-01-15T08:30:00Z",
    updatedAt: "2025-01-15T08:30:00Z"
  },
  {
    id: "LIQ-2025-002", 
    proposerId: "user-5",
    unitId: "4",
    typeAsset: AssetType.CCDC,
    reason: "Thiết bị lỗi thời, không còn phù hợp với yêu cầu giảng dạy hiện tại",
    status: LiquidationStatus.APPROVED,
    createdAt: "2025-01-10T14:20:00Z",
    updatedAt: "2025-01-12T10:15:00Z"
  },
  {
    id: "LIQ-2025-003",
    proposerId: "user-7",
    unitId: "5",
    typeAsset: AssetType.TSCD,
    reason: "Máy tính cũ không đáp ứng được phần mềm mới, cần thay thế",
    status: LiquidationStatus.REJECTED,
    createdAt: "2025-01-08T09:45:00Z", 
    updatedAt: "2025-01-09T16:30:00Z"
  },
  {
    id: "LIQ-2025-004",
    proposerId: "user-3",
    unitId: "3",
    typeAsset: AssetType.TSCD,
    reason: "Tài sản bị hỏng do sự cố cháy nổ, không thể phục hồi",
    status: LiquidationStatus.PROPOSED,
    createdAt: "2025-01-18T11:00:00Z",
    updatedAt: "2025-01-18T11:00:00Z"
  },
  {
    id: "LIQ-2025-005",
    proposerId: "user-4",
    unitId: "2",
    typeAsset: AssetType.CCDC,
    reason: "Thiết bị âm thanh cũ, chất lượng kém, ảnh hưởng đến chất lượng giảng dạy",
    status: LiquidationStatus.APPROVED,
    createdAt: "2025-01-05T13:15:00Z",
    updatedAt: "2025-01-07T09:20:00Z"
  }
];

// Liquidation Proposal Items - Sử dụng các asset ID có sẵn từ mockAssets (asset-001 đến asset-013)
export const mockLiquidationProposalItems: LiquidationProposalItem[] = [
  // Items for LIQ-2025-001 (TSCD) - Tài sản hư hỏng không thể sửa chữa
  {
    id: "ITEM-001",
    proposalId: "LIQ-2025-001",
    assetId: "asset-001", // Máy tính Dell OptiPlex 7090
    reason: "Mainboard hỏng, không thể khởi động, chi phí sửa chữa cao",
    condition: LiquidationProposalItemCondition.DAMAGED,
    mediaUrl: "/assets/computer-damaged.jpg"
  },
  {
    id: "ITEM-002",
    proposalId: "LIQ-2025-001", 
    assetId: "asset-003", // Máy chiếu BenQ MX535
    reason: "Bóng đèn hỏng, máy quá cũ không có phụ tùng thay thế",
    condition: LiquidationProposalItemCondition.DAMAGED,
    mediaUrl: "/assets/projector-broken.jpg"
  },
  {
    id: "ITEM-003",
    proposalId: "LIQ-2025-001",
    assetId: "asset-004", // Router Cisco RV320
    reason: "Không hỗ trợ chuẩn bảo mật mới, có lỗ hổng bảo mật",
    condition: LiquidationProposalItemCondition.UNUSABLE
  },

  // Items for LIQ-2025-002 (CCDC) - Thiết bị lỗi thời
  {
    id: "ITEM-004",
    proposalId: "LIQ-2025-002",
    assetId: "asset-005", // Máy photocopy Canon IR2525
    reason: "Không thể in màu, khay giấy bị kẹt thường xuyên",
    condition: LiquidationProposalItemCondition.DAMAGED,
    mediaUrl: "/assets/photocopy-broken.jpg"
  },
  {
    id: "ITEM-005",
    proposalId: "LIQ-2025-002",
    assetId: "asset-006", // Bàn ghế văn phòng
    reason: "Ghế bị gãy chân, bàn bị cong vênh không sửa được",
    condition: LiquidationProposalItemCondition.DAMAGED
  },

  // Items for LIQ-2025-003 (TSCD) - Máy tính cũ không đáp ứng phần mềm mới
  {
    id: "ITEM-006",
    proposalId: "LIQ-2025-003",
    assetId: "asset-007", // Điều hòa Daikin
    reason: "Hết gas, máy nén hỏng, chi phí sửa chữa cao",
    condition: LiquidationProposalItemCondition.UNUSABLE
  },
  {
    id: "ITEM-007",
    proposalId: "LIQ-2025-003",
    assetId: "asset-008", // Laptop Dell Latitude
    reason: "CPU quá cũ, không hỗ trợ OS mới, pin hỏng hoàn toàn",
    condition: LiquidationProposalItemCondition.UNUSABLE
  },

  // Items for LIQ-2025-004 (TSCD) - Tài sản bị hỏng do cháy nổ
  {
    id: "ITEM-008",
    proposalId: "LIQ-2025-004",
    assetId: "asset-009", // Máy in Canon
    reason: "Hỏng do cháy nổ, không thể phục hồi",
    condition: LiquidationProposalItemCondition.DAMAGED,
    mediaUrl: "/assets/fire-damage.jpg"
  },
  {
    id: "ITEM-009",
    proposalId: "LIQ-2025-004",
    assetId: "asset-010", // Tủ lạnh Samsung
    reason: "Động cơ bị cháy do sự cố điện, vỏ ngoài bị nứt",
    condition: LiquidationProposalItemCondition.DAMAGED,
    mediaUrl: "/assets/fridge-fire-damage.jpg"
  },

  // Items for LIQ-2025-005 (CCDC) - Thiết bị âm thanh cũ
  {
    id: "ITEM-010",
    proposalId: "LIQ-2025-005",
    assetId: "asset-011", // Máy giặt LG
    reason: "Chất lượng âm thanh kém, ảnh hưởng đến chất lượng giảng dạy",
    condition: LiquidationProposalItemCondition.UNUSABLE
  },
  {
    id: "ITEM-011",
    proposalId: "LIQ-2025-005",
    assetId: "asset-012", // Kính hiển vi Olympus
    reason: "Loa bị rè, microphone hỏng",
    condition: LiquidationProposalItemCondition.DAMAGED
  },
  {
    id: "ITEM-012",
    proposalId: "LIQ-2025-005",
    assetId: "asset-013", // Cân điện tử Sartorius
    reason: "Thiết bị đã sử dụng quá lâu, cần thay thế",
    condition: LiquidationProposalItemCondition.UNUSABLE
  }
];

// Helper functions
export const getLiquidationStats = () => {
  const total = mockLiquidationProposals.length;
  const proposed = mockLiquidationProposals.filter(p => p.status === LiquidationStatus.PROPOSED).length;
  const approved = mockLiquidationProposals.filter(p => p.status === LiquidationStatus.APPROVED).length;
  const rejected = mockLiquidationProposals.filter(p => p.status === LiquidationStatus.REJECTED).length;
  
  return { total, proposed, approved, rejected };
};

export const getLiquidationItemsByProposal = (proposalId: string) => {
  return mockLiquidationProposalItems.filter(item => item.proposalId === proposalId);
};

export const searchLiquidationProposals = (query: string) => {
  const searchLower = query.toLowerCase();
  return mockLiquidationProposals.filter(proposal =>
    proposal.id.toLowerCase().includes(searchLower) ||
    proposal.reason.toLowerCase().includes(searchLower)
  );
};

export const filterLiquidationProposalsByStatus = (status: LiquidationStatus) => {
  return mockLiquidationProposals.filter(proposal => proposal.status === status);
};

export const filterLiquidationProposalsByAssetType = (assetType: AssetType) => {
  return mockLiquidationProposals.filter(proposal => proposal.typeAsset === assetType);
};

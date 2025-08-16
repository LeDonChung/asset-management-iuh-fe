// Asset Types and Interfaces

export enum AssetType {
  TSCD = "TSCD", // Tài sản cố định
  CCDC = "CCDC" // Công cụ dụng cụ (đổi thành CCDC theo convention thông thường)
}

export enum AssetStatus {
  CHO_TIEP_NHAN = "chờ_tiếp_nhận", // Tài sản từ ban kế hoạch đầu tư gửi xuống, chờ tiếp nhận
  CHO_PHAN_BO = "chờ_phân_bổ", // Đã tiếp nhận, chờ phân bổ đến đơn vị
  DA_PHAN_BO = "đã_phân_bổ", // Đã phân bổ nhưng chưa di chuyển đến vị trí thực tế
  DANG_SU_DUNG = "đang_sử_dụng", // Đang sử dụng tại vị trí thực tế
  BAO_TRI = "bảo_trì", // Thêm trạng thái bảo trì
  HU_HONG = "hư_hỏng",
  DE_XUAT_THANH_LY = "đề_xuất_thanh_lý",
  THANH_LY = "thanh_lý", // Thêm trạng thái thanh lý
  DA_THANH_LY = "đã_thanh_lý"
}

// User and Role Management
export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}

export interface Role {
  id: string;
  name: string;
  code: string;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  birthDate?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  roles?: Role[];
}

// Unit Management
export enum UnitStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}

export enum UnitType {
  PHONG_KE_HOACH_DAU_TU = "phòng_kế_hoạch_đầu_tư",
  PHONG_QUAN_TRI = "phòng_quản_trị", 
  DON_VI_SU_DUNG = "đơn_vị_sử_dụng"
}

export interface Unit {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  type: UnitType;
  representativeId: string;
  status: UnitStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  representative?: User;
}

// Room Management
export enum RoomStatus {
  ACTIVE = "ACTIVE", 
  INACTIVE = "INACTIVE",
  MAINTENANCE = "MAINTENANCE"
}

export interface Room {
  id: string;
  name: string;
  building?: string;
  floor: string;
  roomNumber?: string;
  area?: number;
  capacity?: number | null;
  description?: string;
  status: RoomStatus;
  unitId: string;
  unit?: Unit;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Transaction Management
export enum TransactionType {
  TRANSFER = "Transfer",
  ALLOCATE = "Allocate", 
  MOVE = "Move"
}

export enum TransactionStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected"
}

export interface AssetTransaction {
  id: string;
  type: TransactionType;
  fromUnitId?: string;
  toUnitId?: string;
  fromRoomId?: string;
  toRoomId?: string;
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  status: TransactionStatus;
  note?: string;
  fromUnit?: Unit;
  toUnit?: Unit;
  fromRoom?: Room;
  toRoom?: Room;
  items?: AssetTransactionItem[];
}

export interface AssetTransactionItem {
  id: string;
  transactionId: string;
  assetId: string;
  note?: string;
  asset?: Asset;
}

export interface Asset {
  id: string;
  ktCode: string; // Mã kế toán: xx-yyyy/nn
  fixedCode: string; // Mã tài sản cố định xxxx.yyyy  
  name: string;
  specs?: string; // Thông số kỹ thuật
  entryDate: string; // Ngày nhập
  plannedRoomId?: string; // Vị trí theo kế hoạch - updated to string
  unit: string; // Đơn vị tính
  quantity: number; // Số lượng
  origin?: string; // Xuất xứ
  purchasePackage: number; // Gói mua
  type: AssetType;
  isLocked: boolean; // Đã bàn giao không cho cập nhật
  categoryId: string; // Danh mục
  status: AssetStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  
  // Relations
  category?: Category;
  room?: Room;
  rfidTag?: RfidTag;
  logs?: AssetLog[];
  transactions?: AssetTransaction[];
}

export interface Category {
  id: string;
  name: string;
  code: string; // 4: máy tính, 3: thiết bị văn phòng, 5: máy in
  parentId?: string;
  parent?: Category;
  children?: Category[];
}

export interface RfidTag {
  rfidId: string; // E280F3362000F00005E66021
  assetId: string;
  assignedDate: string;
  asset?: Asset;
}

export interface AssetLog {
  id: string;
  assetId: string;
  action: string;
  reason: string;
  fromLocation?: string;
  toLocation?: string;
  status: AssetStatus;
  createdBy: string;
  createdAt: string;
  asset?: Asset;
}

// Asset Book Management
export enum BookStatus {
  OPEN = "OPEN",
  CLOSE = "CLOSE"
}

export interface AssetBook {
  id: string;
  unitId: string;
  year: number;
  createdBy: string;
  createdAt: string;
  lockedAt?: string;
  status: BookStatus;
  unit?: Unit;
  items?: AssetBookItem[];
}

export enum AssetBookItemStatus {
  IN_USE = "IN_USE",
  TRANSFERRED = "TRANSFERRED", 
  LIQUIDATED = "LIQUIDATED",
  MISSING = "MISSING"
}

export interface AssetBookItem {
  id: string;
  bookId: string;
  assetId: string;
  roomId: string;
  assignedAt: string;
  quantity: number;
  status: AssetBookItemStatus;
  note?: string;
  book?: AssetBook;
  asset?: Asset;
  room?: Room;
}

// Inventory Management
export enum InventorySessionStatus {
  OPEN = "OPEN",
  INPROGRESS = "INPROGRESS",
  CLOSED = "CLOSED"
}

export interface InventorySession {
  id: string;
  year: number;
  period: number;
  unitId?: string;
  isGlobal: boolean;
  startDate: string;
  endDate: string;
  status: InventorySessionStatus;
  createdBy: string;
  createdAt: string;
  unit?: Unit;
  committees?: InventoryCommittee[];
  results?: InventoryResult[];
}

export interface InventoryCommittee {
  id: string;
  sessionId: string;
  leaderId: string;
  secretaryId: string;
  representativeId: string;
  createdAt: string;
  session?: InventorySession;
  leader?: User;
  secretary?: User;
  representative?: User;
  members?: InventoryCommitteeMember[];
}

export interface InventoryCommitteeMember {
  id: string;
  committeeId: string;
  userId: string;
  role: string;
  committee?: InventoryCommittee;
  user?: User;
}

export enum ScanMethod {
  RFID = "RFID",
  MANUAL = "MANUAL"
}

export enum InventoryResultStatus {
  MATCHED = "MATCHED",
  MISSING = "MISSING",
  EXCESS = "EXCESS", 
  BROKEN = "BROKEN",
  LIQUIDATION_PROPOSED = "LIQUIDATION_PROPOSED"
}

export interface InventoryResult {
  id: string;
  sessionId: string;
  assetId: string;
  systemQuantity: number;
  countedQuantity: number;
  scanMethod: ScanMethod;
  status: InventoryResultStatus;
  note?: string;
  createdAt: string;
  session?: InventorySession;
  asset?: Asset;
}

// Alert Management
export enum AlertStatus {
  PENDING = "PENDING",
  RESOLVED = "RESOLVED"
}

export enum AlertType {
  UNAUTHORIZED_MOVEMENT = "UNAUTHORIZED_MOVEMENT"
}

export interface Alert {
  id: string;
  assetId: string;
  detectedAt: string;
  roomId: string;
  type: AlertType;
  status: AlertStatus;
  createdAt: string;
  asset?: Asset;
  room?: Room;
  resolution?: AlertResolution;
}

export enum AlertResolutionStatus {
  CONFIRMED = "CONFIRMED",
  FALSE_ALARM = "FALSE_ALARM",
  SYSTEM_ERROR = "SYSTEM_ERROR"
}

export interface AlertResolution {
  id: string;
  alertId: string;
  resolverId: string;
  resolution: AlertResolutionStatus;
  note?: string;
  resolvedAt: string;
  alert?: Alert;
  resolver?: User;
}

// Damage Report Management  
export enum DamageReportStatus {
  REPORTED = "REPORTED",
  IN_REVIEW = "IN_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

export interface DamageReport {
  id: string;
  assetId: string;
  reporter: string;
  roomId: string;
  description: string;
  mediaUrl?: string;
  status: DamageReportStatus;
  createdAt: string;
  updatedAt: string;
  asset?: Asset;
  room?: Room;
}

// Liquidation Management
export enum LiquidationStatus {
  PROPOSED = "PROPOSED",
  APPROVED = "APPROVED", 
  REJECTED = "REJECTED"
}

export interface LiquidationProposal {
  id: string;
  proposerId: string;
  unitId: string;
  reason: string;
  status: LiquidationStatus;
  createdAt: string;
  updatedAt: string;
  proposer?: User;
  unit?: Unit;
  items?: LiquidationProposalItem[];
}

export enum LiquidationProposalItemCondition {
  DAMAGED = "DAMAGED",
  UNUSABLE = "UNUSABLE"
}

export interface LiquidationProposalItem {
  id: string;
  proposalId: string;
  assetId: string;
  reason: string;
  condition: LiquidationProposalItemCondition;
  mediaUrl?: string;
  proposal?: LiquidationProposal;
  asset?: Asset;
}

export interface AssetFilter {
  search?: string;
  status?: AssetStatus;
  type?: AssetType;
  categoryId?: string;
  roomId?: string;
  unitId?: string;
  isLocked?: boolean;
  hasRfid?: boolean;
  entryDateFrom?: string; // Thêm trường lọc theo ngày từ
  entryDateTo?: string;   // Thêm trường lọc theo ngày đến
}

export interface AssetFormData {
  name: string;
  specs?: string;
  entryDate: string;
  plannedRoomId?: string; // updated to string
  unit: string;
  quantity: number;
  origin?: string;
  purchasePackage: number;
  type: AssetType;
  categoryId: string;
}

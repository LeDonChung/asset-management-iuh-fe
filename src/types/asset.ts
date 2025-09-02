// Asset Types and Interfaces

export enum AssetType {
  TSCD = "TSCD", // Tài sản cố định
  CCDC = "CCDC" // Công cụ dụng cụ
}

export enum AssetStatus {
  CHO_CHUYEN_GIAO = "chờ_bàn_giao",
  CHO_TIEP_NHAN = "chờ_tiếp_nhận",
  CHO_PHAN_BO = "chờ_phân_bổ",
  DANG_SU_DUNG = "đang_sử_dụng", 
  HU_HONG = "hư_hỏng",
  DE_XUAT_THANH_LY = "đề_xuất_thanh_lý",
  DA_THANH_LY = "đã_thanh_lý"
}

// Asset Log Types
export enum AssetLogStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS", 
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

export interface AssetLog {
  id: string;
  assetId: string;
  action: string;
  reason: string;
  status: AssetLogStatus;
  fromLocation?: string;
  toLocation?: string;
  createdAt: string;
  createdBy: string;
  asset?: Asset;
}

// Asset Transaction Types
export enum TransactionType {
  ALLOCATE = "ALLOCATE", // Phân bổ
  HANDOVER = "HANDOVER", // Bàn giao
  RETURN = "RETURN", // Hoàn trả
  LIQUIDATE = "LIQUIDATE" // Thanh lý
}

export enum TransactionStatus {
  PENDING = "PENDING", // Chờ duyệt
  APPROVED = "APPROVED", // Đã duyệt
  REJECTED = "REJECTED", // Từ chối
}

export interface AssetTransactionItem {
  id: string;
  transactionId: string;
  assetId: string;
  note?: string;
  asset?: Asset;
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
  status: TransactionStatus;
  note?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  fromUnit?: Unit;
  toUnit?: Unit;
  fromRoom?: Room;
  toRoom?: Room;
  items?: AssetTransactionItem[];
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
  username: string; // Tài khoản: Mã nhân viên
  password?: string; // Không hiển thị trong frontend
  fullName: string;
  email: string;
  unitId?: string; // Đơn vị
  phoneNumber?: string;
  birthDate?: string; // date
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  roles?: Role[];
  unit?: Unit; // Relation to Unit
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
  name: string; // Tên đơn vị sử dụng
  phone?: string; // Số điện thoại
  email?: string; // Email
  type: UnitType;
  representativeId: string; // Người đại diện
  status: UnitStatus;
  createdBy: string;
  createdAt: string; // date
  updatedAt: string; // date
  deletedAt?: string; // date
  representative?: User;
}

// Room Management
export enum RoomStatus {
  ACTIVE = "ACTIVE", 
  INACTIVE = "INACTIVE"
}

export interface Room {
  id: string;
  name: string;
  building?: string; // Tòa
  floor: string; // Tầng
  roomNumber?: string; // Số phòng / tên phòng
  adjacentRooms?: string[]; // Danh sách ID các phòng cạnh bên
  status: RoomStatus;
  unitId: string; // Mã đơn vị sử dụng
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  unit?: Unit;
}

export interface Asset {
  id: string;
  ktCode: string; // Mã kế toán: xx-yyyy/nn
  fixedCode: string; // Mã tài sản cố định xxxx.yyyy  
  name: string;
  specs?: string; // Thông số kỹ thuật
  entryDate: string; // Ngày nhập (date)
  currentRoomId?: string; // Vị trí hiện tại, null là đang nhập kho, chưa phân bổ
  unit: string; // Đơn vị tính
  quantity: number; // Số lượng (Với tài sản cố định = 1)
  origin?: string; // Xuất xứ
  purchasePackage: number; // Gói mua
  type: AssetType;
  isLocked: boolean; // Khi đã bàn giao thì không cho cập nhật lại
  isHandOver: boolean; // Đã bàn giao
  categoryId: string; // Danh mục - 4: máy tính, 3: thiết bị văn phòng, 5: máy in
  status: AssetStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  
  // Thông tin bàn giao (cho sổ tài sản)
  assignedDate?: string; // Ngày bàn giao
  assignedTo?: string; // Người được bàn giao
  department?: string; // Phòng ban
  location?: string; // Vị trí cụ thể
  
  // Relations
  category?: Category;
  room?: Room;
  rfidTag?: RfidTag;
  logs?: AssetLog[];
  transactionItems?: AssetTransactionItem[];
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
  rfidId: string; // E280F3362000F00005E66021 - primary key
  assetId: string; // Mã tài sản
  assignedDate: string; // Ngày định danh và đưa vào tài sản
  asset?: Asset;
}



// Asset Book Management
export enum BookStatus {
  OPEN = "OPEN",
  CLOSE = "CLOSE"
}

export interface AssetBook {
  id: string;
  unitId: string; // Đơn vị quản lý sổ
  year: number; // Năm
  createdBy: string;
  createdAt: string; // datetime
  lockedAt?: string; // datetime - Khóa sổ khi kết thúc năm
  status: BookStatus; // Open, Closed
  unit?: Unit;
  items?: AssetBookItem[];
}

export enum AssetBookItemStatus {
  IN_USE = "IN_USE", // Đang sử dụng
  TRANSFERRED = "TRANSFERRED", // Đã được di chuyển đi chỗ khác
  LIQUIDATED = "LIQUIDATED", // Đã được thanh lý
  MISSING = "MISSING" // Đã thất lạc
}

export interface AssetBookItem {
  id: string;
  bookId: string;
  assetId: string;
  roomId: string;
  assignedAt: string; // datetime - Ngày được ghi nhận vào sổ
  quantity: number; // Số lượng thực tế trong sổ
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
  year: number; // Năm
  period: number; // Đợt
  unitId?: string; // Nếu chỉ cho 1 đơn vị thì isGlobal = false và unitId != null
  isGlobal: boolean; // true: Một kỳ cho toàn bộ các đơn vị sử dụng, false: Một kỳ cho một đơn vị sử dụng
  startDate: string; // date
  endDate: string; // date
  status: InventorySessionStatus;
  createdBy: string;
  createdAt: string; // datetime
  unit?: Unit;
  committees?: InventoryCommittee[];
  results?: InventoryResult[];
}

export interface InventoryCommittee {
  id: string;
  sessionId: string;
  leaderId: string; // Trưởng phòng
  secretaryId: string; // Thư ký
  representativeId: string; // Đại diện đơn vị sử dụng
  createdAt: string; // datetime
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
  role: string; // Vai trò: Member, Auditor,…
  committee?: InventoryCommittee;
  user?: User;
}

export enum ScanMethod {
  RFID = "RFID", // Bằng RFID
  MANUAL = "MANUAL" // Bằng thủ công
}

export enum InventoryResultStatus {
  MATCHED = "MATCHED", // Khớp
  MISSING = "MISSING", // Thiếu
  EXCESS = "EXCESS", // Thừa
  BROKEN = "BROKEN", // Hỏng
  LIQUIDATION_PROPOSED = "LIQUIDATION_PROPOSED" // Đề xuất thanh lý
}

export interface InventoryResult {
  id: string;
  sessionId: string;
  assetId: string;
  systemQuantity: number; // Số lượng trên hệ thống (default: 1)
  countedQuantity: number; // Số lượng kiểm kê thực tế (default: 0)
  scanMethod: ScanMethod; // Phương thức kiểm kê
  status: InventoryResultStatus; // Trạng thái kiểm kê của tài sản
  note?: string;
  createdAt: string; // datetime
  session?: InventorySession;
  asset?: Asset;
}

// Alert Management
export enum AlertStatus {
  PENDING = "PENDING",
  RESOLVED = "RESOLVED"
}

export enum AlertType {
  UNAUTHORIZED_MOVEMENT = "UNAUTHORIZED_MOVEMENT" // Di chuyển không hợp lệ
}

export interface Alert {
  id: string;
  assetId: string;
  detectedAt: string; // datetime - Thời gian phát hiện
  roomId: string;
  type: AlertType; // Di chuyển không hợp lệ
  status: AlertStatus;
  createdAt: string; // datetime
  asset?: Asset;
  room?: Room;
  resolution?: AlertResolution;
}

export enum AlertResolutionStatus {
  CONFIRMED = "CONFIRMED", // Đã xác minh
  FALSE_ALARM = "FALSE_ALARM", // Sai phạm
  SYSTEM_ERROR = "SYSTEM_ERROR" // Lỗi hệ thống
}

export interface AlertResolution {
  id: string;
  alertId: string;
  resolverId: string;
  resolution: AlertResolutionStatus;
  note?: string;
  resolvedAt: string; // datetime
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
  reporter: string; // Tên người report
  roomId: string;
  description: string; // text - Mô tả
  mediaUrl?: string; // Ảnh / Video minh chứng
  status: DamageReportStatus;
  createdAt: string; // datetime
  updatedAt: string; // datetime
  asset?: Asset;
  room?: Room;
}

// Liquidation Management
export enum LiquidationStatus {
  PROPOSED = "PROPOSED", // Đề xuất thanh lý
  APPROVED = "APPROVED", // Chấp nhận
  REJECTED = "REJECTED" // Từ chối
}

export interface LiquidationProposal {
  id: string;
  proposerId: string; // Người đề xuất
  unitId: string; // Đơn vị sử dụng
  reason: string; // text
  status: LiquidationStatus; // Trạng thái đề xuất
  createdAt: string; // datetime
  updatedAt: string; // datetime
  proposer?: User;
  unit?: Unit;
  items?: LiquidationProposalItem[];
}

export enum LiquidationProposalItemCondition {
  DAMAGED = "DAMAGED", // Hư hỏng
  UNUSABLE = "UNUSABLE" // Không thể sử dụng
}

export interface LiquidationProposalItem {
  id: string;
  proposalId: string;
  assetId: string;
  reason: string; // text
  condition: LiquidationProposalItemCondition; // Trạng thái tài sản hiện tại
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
  isHandOver?: boolean; // Thêm trường lọc theo trạng thái bàn giao
  hasRfid?: boolean;
  entryDateFrom?: string; // Thêm trường lọc theo ngày từ
  entryDateTo?: string;   // Thêm trường lọc theo ngày đến
}

export interface AssetFormData {
  name: string;
  specs?: string;
  entryDate: string;
  currentRoomId?: string; // ID phòng theo kế hoạch
  unit: string;
  quantity: number;
  origin?: string;
  purchasePackage: number;
  type: AssetType;
  categoryId: string;
}

// Additional interfaces for Asset Book Management with Role-based Access
export interface AssetBookFilter {
  unitId?: string;
  year?: number;
  status?: BookStatus;
  search?: string;
}

export interface AssetBookItemFilter {
  bookId?: string;
  assetId?: string;
  roomId?: string;
  status?: AssetBookItemStatus;
  assignedDateFrom?: string;
  assignedDateTo?: string;
}

export interface UserPermissions {
  canViewAllUnits: boolean;
  canManageAssetBooks: boolean;
  canCreateAssetBooks: boolean;
  canLockAssetBooks: boolean;
  allowedUnits: string[]; // Array of unit IDs the user can access
}

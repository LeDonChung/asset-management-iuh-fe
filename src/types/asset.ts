// Asset Types and Interfaces

export enum AssetType {
  TSCD = "TSCD", // Tài sản cố định
  CCDC = "CCDC", // Công cụ dụng cụ
  FIXED_ASSET = "FIXED_ASSET", // Tài sản cố định
  TOOLS_EQUIPMENT = "TOOLS_EQUIPMENT", // Công cụ dụng cụ
}

export enum AssetStatus {
  IN_USE = "IN_USE", // đang sử dụng
  WAITING_HANDOVER = "WAITING_HANDOVER", // chờ bàn giao
  WAITING_RECEIVE = "WAITING_RECEIVE", // chờ tiếp nhận
  TRANSFERRED = "TRANSFERRED", // đã bàn giao (trong sổ cũ)
  DAMAGED = "DAMAGED", // hư hỏng
  LOST = "LOST", // đã mất
  PROPOSED_LIQUIDATION = "PROPOSED_LIQUIDATION", // đề xuất thanh lý
  LIQUIDATED = "LIQUIDATED", // đã thanh lý
  WAITING_ALLOCATION = "WAITING_ALLOCATION", // chờ phân bổ
}

// Asset Log Types
export enum AssetLogStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
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
  TRANSFER = "TRANSFER", // Bàn giao
  INTERNAL_MOVE = 'INTERNAL_MOVE',   // Di chuyển nội bộ (không cần phê duyệt)
}

export enum TransactionStatus {
  DRAFT = 'DRAFT',           // Bản nháp
    PROPOSED = 'PROPOSED',        // Đề xuất bàn giao (gửi lên phòng quản trị)
    APPROVED = 'APPROVED',        // Phòng quản trị chấp nhận - tự động cập nhật tài sản
    REJECTED = 'REJECTED',        // Phòng quản trị từ chối
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
  INACTIVE = "INACTIVE",
  LOCKED = "LOCKED",
  DELETED = "DELETED",
}

export interface Role {
  id: string;
  name: string;
  code: string;
  permissions?: Permission[];
  isProtected?: boolean;
}

export interface ManagerPermission {
  id: string;
  name: string;
  permissions?: Permission[];
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
  INACTIVE = "INACTIVE",
}

export enum UnitType {
  CAMPUS = "CAMPUS",                    // Cơ sở (root level)
  ADMIN_DEPT = "ADMIN_DEPT",           // Phòng quản trị
  USER_DEPT = "USER_DEPT",             // Đơn vị sử dụng
}

export interface Unit {
  id: string;
  name: string; // Tên đơn vị sử dụng
  phone?: string; // Số điện thoại
  email?: string; // Email
  type: UnitType;
  representativeId: string; // Người đại diện
  parentUnitId?: string; // ID của đơn vị cha (null nếu là cơ sở root)
  status: UnitStatus;
  createdBy: string;
  createdAt: string; // date
  updatedAt: string; // date
  deletedAt?: string; // date
  representative?: User;
  parentUnit?: Unit; // Thông tin đơn vị cha
  childUnits?: Unit[]; // Đơn vị con
}

// Room Management
export enum RoomStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface Room {
  id: string;
  name?: string;
  roomCode: string; // Mã phòng
  building?: string; // Tòa
  floor: string; // Tầng
  roomNumber?: string; // Số phòng / tên phòng
  adjacentRooms?: Room[]; // Danh sách ID các phòng cạnh bên
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
  entrydate: string; // Ngày nhập (date)
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
  note?: string;
  // Thông tin bàn giao (cho sổ tài sản)
  assignedDate?: string; // Ngày bàn giao
  assignedTo?: string; // Người được bàn giao
  department?: string; // Phòng ban
  location?: string; // Vị trí cụ thể
  currentRoom?: Room;

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
  CLOSE = "CLOSE",
}

export enum AssetBookStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

export interface AssetBook {
  id: string;
  unitId: string; // Đơn vị quản lý sổ
  year: number; // Năm
  lookedAt?: Date; // Ngày xem sổ
  status: AssetBookStatus;
  unit?: Unit;
  assetTypes?: AssetTypeResponse[];
}

export interface AssetTypeResponse {
  type: AssetType;
  items: AssetBookItem[];
}

export enum AssetBookItemStatus {
  IN_USE = "IN_USE", // Đang sử dụng
  TRANSFERRED = "TRANSFERRED", // Đã được di chuyển đi chỗ khác
  LIQUIDATED = "LIQUIDATED", // Đã được thanh lý
  MISSING = "MISSING", // Đã thất lạc
}

export interface AssetBookItem {
  id: string;
  roomId: string;
  assetId: string;
  assignedAt: Date; // datetime - Ngày được ghi nhận vào sổ
  quantity: number; // Số lượng thực tế trong sổ
  status: AssetBookItemStatus;
  note?: string;
  asset?: Asset;
  room?: Room;
}

// Alert Management
export enum AlertStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED", // Đã xác minh
  FALSE_ALARM = "FALSE_ALARM", // Sai phạm
  SYSTEM_ERROR = "SYSTEM_ERROR", // Lỗi hệ thống
}

export enum AlertType {
  UNAUTHORIZED_MOVEMENT = "UNAUTHORIZED_MOVEMENT", // Di chuyển không hợp lệ
}

export interface Alert {
  id: string;
  assetId: string;
  roomId: string;
  type: AlertType; // Di chuyển không hợp lệ
  status: AlertStatus;
  createdAt: string; // datetime
  asset?: Asset;
  room?: Room;
  image?: string; // URL ảnh chụp
  deviceId?: string; // ID thiết bị phát hiện
  resolver?: User; // Người xử lý cảnh báo
  resolvedAt?: string; // datetime - Thời gian xử lý
  note?: string; // Ghi chú xử lý
}

// Damage Report Management
export enum DamageReportStatus {
  REPORTED = "REPORTED",
  IN_REVIEW = "IN_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
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
  DRAFT = "DRAFT", // Bản nháp, chưa gửi đề xuất
  PROPOSED = "PROPOSED", // Đề xuất thanh lý
  APPROVED = "APPROVED", // Phòng quản trị chấp nhận và gửi minh chứng
  REJECTED = "REJECTED", // Phòng quản trị từ chối
  FINALIZED = "FINALIZED", // Bên trường duyệt xong, cập nhật minh chứng hoàn tất
}

export interface LiquidationProposal {
  id: string;
  proposerId: string; // Người đề xuất
  unitId: string; // Đơn vị sử dụng
  assetType: AssetType; // Loại tài sản trong danh sách thanh lý
  status: LiquidationStatus; // Trạng thái đề xuất
  createdAt: string; // datetime
  updatedAt: string; // datetime
  proposer?: User;
  unit?: Unit;
  items?: LiquidationProposalItem[];
}

export enum LiquidationProposalItemCondition {
  DAMAGED = "DAMAGED", // Hư hỏng
  UNUSABLE = "UNUSABLE", // Không thể sử dụng
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
  entryDateTo?: string; // Thêm trường lọc theo ngày đến
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

// ============================================================
// INVENTORY MANAGEMENT TYPES
// ============================================================

// Inventory Session Status
export enum InventorySessionStatus {
  PLANNED = "PLANNED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CLOSED = "CLOSED",
}

export interface FileUrl {
  id: string;
  url: string;
}

export interface InventorySessionMember {
  id: string;
  sessionId: string;
  userId: string;
  role: string;
  user?: User;
  session?: InventorySession;
}

// Inventory Session (Kỳ kiểm kê)
export interface InventorySession {
  id: string;
  year: number; // Năm
  name: string; // Tên kỳ kiểm kê, ví dụ: Kiểm kê cuối năm
  period: number; // Đợt
  isGlobal: boolean; // true: Một kỳ cho toàn bộ các đơn vị sử dụng, false: Một kì cho một đơn vị sử dụng
  startDate: string; // date
  endDate: string; // date
  evidenceFiles?: FileUrl[]; // URLs của file minh chứng
  status: InventorySessionStatus;
  createdBy: string;
  createdAt: string; // datetime
  creator?: User;
  units?: InventorySessionUnit[]; // Đơn vị tham gia
  committees?: InventoryCommittee; // Ban kiểm kê
  inventorySessionUnits?: InventorySessionUnit[]; // Đơn vị tham gia
  members?: InventorySessionMember[]; // Thành viên ban kiểm kê
}

// Đơn vị tham gia kỳ kiểm kê
export interface InventorySessionUnit {
  id: string;
  sessionId: string;
  subInventoryId?: string;
  subInventory?: InventorySubCommittee;
  unitId: string;
  unit?: Unit;
  session?: InventorySession;
}

// Ban kiểm kê chính
export interface InventoryCommittee {
  id: string;
  sessionId: string;
  name: string; // Tên ban, ví dụ: Ban kiểm kê tài sản năm 2024
  createdAt: string; // datetime
  session?: InventorySession;
  members?: InventoryCommitteeMember[]; // Thành viên ban kiểm kê
  subCommittees?: InventorySubCommittee[]; // Tiểu ban
}

// Vai trò thành viên ban kiểm kê
export enum InventoryCommitteeRole {
  // TIỂU BAN
  SUB_COMMITTEE_LEADER = "SUB_COMMITTEE_LEADER", // TRƯỞNG TIỂU BAN
  VICE_SUB_COMMITTEE_LEADER = "VICE_SUB_COMMITTEE_LEADER", // PHÓ TRƯỞNG TIỂU BAN

  // NHÓM
  LEADER = "LEADER", // TRƯỞNG NHÓM
  DEPUTY_LEADER = "DEPUTY_LEADER", // PHÓ TRƯỞNG NHÓM

  // BAN CHÍNH
  CHAIR = "CHAIR", // TRƯỞNG BAN
  VICE_CHAIR = "VICE_CHAIR", // PHÓ TRƯỞNG BAN
  CHIEF_SECRETARY = "CHIEF_SECRETARY", // THƯ KÝ TỔNG HỢP
  MEMBER = "MEMBER", // ỦY VIÊN

  // DÙNG CHUNG
  SECRETARY = "SECRETARY", // THƯ KÝ
}

// Thành viên ban kiểm kê
export interface InventoryCommitteeMember {
  id: string;
  committeeId: string;
  userId?: string;
  role: InventoryCommitteeRole;
  responsibility?: string;
  committee?: InventoryCommittee;
  user?: User;
}

// Vai trò thành viên tiểu ban
export enum InventorySubCommitteeRole {
  LEADER = "LEADER", // Trưởng tiểu ban
  SECRETARY = "SECRETARY", // Thư ký
  MEMBER = "MEMBER", // Thành viên
}

// Thành viên tiểu ban (Backend: SubInventoryMember)
export interface InventorySubCommitteeMember {
  id: string;
  subInventoryId: string; // Backend uses subInventoryId instead of subCommitteeId
  userId: string;
  role: string; // Backend uses CommitteeRole enum as string
  notes?: string; // Ghi chú thêm
  createdAt: string;
  updatedAt: string;
  subCommittee?: InventorySubCommittee;
  user?: User;
}

// Tiểu ban (Backend: InventorySub)
export interface InventorySubCommittee {
  id: string;
  name: string; // Tên tiểu ban
  inventorySessionUnitId: string; // ID của cơ sở tham gia
  status: string; // Trạng thái tiểu ban
  description?: string; // Mô tả tiểu ban
  createdAt: string; // datetime
  updatedAt: string; // datetime
  inventorySessionUnit?: InventorySessionUnit;
  members?: InventorySubCommitteeMember[]; // Thành viên tiểu ban
  groups?: InventoryGroup[]; // Nhóm trong tiểu ban
}

// Nhóm trong tiểu ban (Backend: InventoryGroup)
export interface InventoryGroup {
  id: string;
  subInventoryId: string; // Backend uses subInventoryId instead of subCommitteeId
  name: string; // Tên nhóm
  description?: string; // Mô tả nhóm
  status: string; // Trạng thái nhóm
  createdAt: string; // datetime
  updatedAt: string; // datetime
  subInventory?: InventorySubCommittee; // Backend relation name
  members?: InventoryGroupMember[]; // Thành viên nhóm
  assignments?: InventoryGroupAssignment[]; // Phân công kiểm kê
}

// Vai trò thành viên nhóm
export enum InventoryGroupRole {
  LEADER = "LEADER",
  SECRETARY = "SECRETARY",
  MEMBER = "MEMBER",
}

// Thành viên nhóm (Backend: InventoryGroupMember)
export interface InventoryGroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: string; // Backend uses CommitteeRole enum as string
  notes?: string; // Ghi chú thêm
  createdAt: string;
  updatedAt: string;
  group?: InventoryGroup;
  user?: User;
}

// Phân công nhóm kiểm kê cho đơn vị (Backend: InventoryGroupAssignment)
export interface InventoryGroupAssignment {
  id: string;
  groupId: string;
  unitId: string;
  startDate: string; // date - Ngày bắt đầu kiểm kê tại đơn vị
  endDate: string; // date - Ngày kết thúc kiểm kê tại đơn vị
  note?: string;
  createdAt: string;
  group?: InventoryGroup;
  unit?: Unit;
  results?: InventoryResult[]; // Kết quả kiểm kê
}

// Phương thức quét
export enum ScanMethod {
  RFID = "RFID", // Bằng RFID
  MANUAL = "MANUAL", // Bằng thủ công
}

// Trạng thái kết quả kiểm kê
export enum InventoryResultStatus {
  MATCHED = "MATCHED", // Khớp
  MISSING = "MISSING", // Thiếu
  EXCESS = "EXCESS", // Thừa
  BROKEN = "BROKEN", // Hư hỏng
  NEEDS_REPAIR = "NEEDS_REPAIR", // Cần sửa chữa
  LIQUIDATION_PROPOSED = "LIQUIDATION_PROPOSED", // Đề xuất thanh lý
}

// Kết quả kiểm kê
export interface InventoryResult {
  id: string;
  assignmentId: string; // Phân công kiểm kê
  assetId: string;
  systemQuantity: number; // Số lượng trên hệ thống
  countedQuantity: number; // Số lượng thực tế kiểm kê
  scanMethod?: ScanMethod;
  status: InventoryResultStatus;
  imageUrls: string[];
  note?: string;
  createdAt: string; // datetime
  assignment?: InventoryGroupAssignment;
  asset?: Asset;
}

// Filter interfaces for inventory management
export interface InventorySessionFilter {
  search?: string;
  year?: number;
  status?: InventorySessionStatus;
  isGlobal?: boolean;
  unitId?: string;
  startDateFrom?: string;
  startDateTo?: string;
}

export interface InventoryResultFilter {
  search?: string;
  assignmentId?: string;
  status?: InventoryResultStatus;
  scanMethod?: ScanMethod;
  assetId?: string;
  unitId?: string;
}

// Form data interfaces
export interface InventorySessionFormData {
  year: number;
  name: string;
  period: number;
  isGlobal: boolean;
  startDate: string;
  endDate: string;
  status: InventorySessionStatus;
  fileUrls?: string[];
  unitIds?: string[];
}

export interface InventoryCommitteeFormData {
  sessionId: string;
  name: string;
  members: {
    userId: string;
    role: InventoryCommitteeRole;
  }[];
}

export interface InventorySubCommitteeFormData {
  committeeId: string;
  name: string;
  leaderId: string;
  secretaryId: string;
}

export interface InventoryGroupFormData {
  subCommitteeId: string;
  name: string;
  leaderId: string;
  secretaryId: string;
  members: {
    userId: string;
    role: InventoryGroupRole;
  }[];
}

export interface InventoryGroupAssignmentFormData {
  groupId: string;
  unitId: string;
  startDate: string;
  endDate: string;
  note?: string;
}

export interface InventoryResultFormData {
  assignmentId: string;
  assetId: string;
  systemQuantity: number;
  countedQuantity: number;
  scanMethod?: ScanMethod;
  status: InventoryResultStatus;
  note?: string;
}

// Liquidation Filter
export interface LiquidationProposalFilterRequest extends BaseFilterRequest {
  search?: string | null;
  status?: LiquidationStatus;
  unitId?: string;
  year?: number;
}

// Liquidation Proposed Inventory Result Filter (matching backend LiquidationProposedFilterDto)
export interface LiquidationProposedFilterRequest extends BaseFilterRequest {
  search?: string; // Tìm kiếm theo tên tài sản, mã tài sản
  roomId?: string; // ID phòng (để lọc theo phòng cụ thể)
  assetType?: AssetType; // Loại tài sản
}

// Liquidation Proposed Inventory Result (matching backend LiquidationProposedInventoryResultDto)
export interface LiquidationProposedInventoryResult {
  id: string;
  systemQuantity: number;
  countedQuantity: number;
  note: string;
  scanMethod: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  asset: Asset;
  room: {
    id: string;
    name: string;
    code: string;
  };
  inventorySession: {
    id: string;
    name: string;
    year: number;
  };
  fileUrls?: {
    id: string;
    url: string;
    createdAt: string;
  }[];
}

// Backend filter enums and types (matching AdvancedFilter)
export enum FilterOperator {
  EQUALS = "equals",
  CONTAINS = "contains",
  STARTS_WITH = "startsWith",
  ENDS_WITH = "endsWith",
  GREATER_THAN = "gt",
  GREATER_THAN_OR_EQUAL = "gte",
  LESS_THAN = "lt",
  LESS_THAN_OR_EQUAL = "lte",
  IN = "in",
  NOT_IN = "notIn",
  BETWEEN = "between",
}

export enum FieldType {
  TEXT = "text",
  NUMBER = "number",
  DATE = "date",
  SELECT = "select",
  BOOLEAN = "boolean",
}

export enum ConditionLogic {
  AND = "and",
  OR = "or",
  CONTAINS = "contains",
}

// Types for filter system
export interface SortConfig {
  field?: string;
  direction?: string;
  priority?: number;
}

export interface Panigation {
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
  totalPages?: number;
}
export interface FilterCondition {
  field: string;
  fieldType: FieldType;
  operator: FilterOperator;
  value: any[];
  dateFrom?: string;
  dateTo?: string;
  sort?: "asc" | "desc";
}

export interface BaseFilterRequest {
  conditionLogic?: ConditionLogic;
  conditions?: FilterCondition[];
  pagination?: Panigation;
  sorting?: Array<SortConfig>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
    nextPage?: number | null;
    prevPage?: number | null;
    firstPage?: number;
    lastPage?: number;
  };
}

// ============================================================
// LIQUIDATION DTOs (matching backend DTOs)
// ============================================================

// DTO for creating liquidation item
export interface CreateLiquidationItemDto {
  assetId: string; // ID của tài sản cần thanh lý
  systemQuantity: number; // Số lượng theo sổ sách
  countedQuantity: number; // Số lượng theo kiểm kê thực tế
  note?: string; // Ghi chú thêm về tài sản
  imageUrl?: string; // URL hình ảnh minh chứng
}

// DTO for creating liquidation proposal
export interface CreateLiquidationProposalDto {
  unitId: string; // ID của đơn vị đề xuất thanh lý
  status?: LiquidationStatus; // Trạng thái đề xuất (DRAFT hoặc PROPOSED)
  assetType: AssetType; // Loại tài sản
  items: CreateLiquidationItemDto[]; // Danh sách tài sản trong đề xuất thanh lý
}

// DTO for updating liquidation item
export interface UpdateLiquidationItemDto {
  id?: string; // ID của item (nếu có - để cập nhật item hiện tại)
  assetId: string; // ID của tài sản cần thanh lý
  systemQuantity: number; // Số lượng theo sổ sách
  countedQuantity: number; // Số lượng theo kiểm kê thực tế
  note?: string; // Ghi chú thêm về tài sản
  imageUrl?: string; // URL hình ảnh minh chứng
}

// DTO for updating liquidation proposal
export interface UpdateLiquidationProposalDto {
  unitId?: string; // ID của đơn vị đề xuất thanh lý
  items?: UpdateLiquidationItemDto[]; // Danh sách tài sản trong đề xuất thanh lý (sẽ thay thế toàn bộ danh sách hiện tại)
}

// DTO for updating liquidation status
export interface UpdateLiquidationStatusDto {
  status: LiquidationStatus; // Trạng thái mới
  note?: string; // Ghi chú khi thay đổi trạng thái
  evidenceUrl?: string; // URL minh chứng đính kèm
}

// DTO for uploading evidence
export interface UploadEvidenceDto {
  evidenceUrl: string; // URL minh chứng cần upload
  note?: string; // Ghi chú về minh chứng
}

// Response DTO for liquidation item
export interface LiquidationItemResponseDto {
  id: string;
  proposalId: string;
  assetId: string;
  systemQuantity: number;
  countedQuantity: number;
  note?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  asset?: {
    type: string;
    id: string;
    ktCode: string;
    fixedCode: string;
    name: string;
    specs?: string;
    entrydate: string;
    currentRoomId?: string;
    unit: string;
    quantity: number;
    origin?: string;
    purchasePackage: number;
    categoryId: string;
    status: string;
    allowMove: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    currentRoom?: {
      id: string;
      name: string;
      building?: string;
      roomCode: string;
      floor: string;
      roomNumber?: string;
      status: string;
      unitId: string;
      createdAt: string;
      updatedAt: string;
      deletedAt?: string | null;
    };
  };
}

// Response DTO for liquidation history
export interface LiquidationHistoryResponseDto {
  id: string;
  actionStatus: LiquidationStatus;
  evidenceUrl?: string;
  note?: string;
  createdAt: string;
  handler?: {
    id: string;
    fullName: string;
  };
}

// Response DTO for liquidation proposal (matching backend entity)
export interface LiquidationProposalResponseDto {
  id: string;
  proposerId: string;
  unitId: string;
  status: LiquidationStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  assetType: AssetType;
  proposer?: {
    id: string;
    fullName: string;
    email: string;
  };
  unit?: {
    id: string;
    name: string;
  };
  items?: LiquidationItemResponseDto[];
  histories?: LiquidationHistoryResponseDto[];
}

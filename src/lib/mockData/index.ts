// Mock Data Exports
export { mockUnits } from './units';
export { mockRooms } from './rooms';
export { mockUsers, mockRoles } from './users';
export { mockCategories } from './categories';
export { mockAssets } from './assets';
export { mockAssetLogs } from './assetLogs';
export { mockAlerts, mockAlertResolutions, AlertHelpers } from './alerts';
export { 
  mockLiquidationProposals, 
  mockLiquidationProposalItems,
  getLiquidationItemsByProposal,
  getLiquidationProposalWithItems,
  getLiquidationStats,
  getLiquidationProposalsByUnit,
  getLiquidationProposalsByProposer,
  getLiquidationProposalsByStatus,
  getLiquidationProposalsByDateRange,
  searchLiquidationProposals
} from './liquidation';

// Helper functions
export { MockDataHelper } from './helpers';

// Combined exports for convenience
export const mockData = {
  units: () => import('./units').then(m => m.mockUnits),
  rooms: () => import('./rooms').then(m => m.mockRooms),
  users: () => import('./users').then(m => m.mockUsers),
  roles: () => import('./users').then(m => m.mockRoles),
  categories: () => import('./categories').then(m => m.mockCategories),
  assets: () => import('./assets').then(m => m.mockAssets)
};

export interface Roommate {
  id: string;
  name: string;
  phone?: string;
  roomArea: number;
  shareRatio: number;
  moveInDate: string;
  avatar?: string;
}

export interface RentalProfile {
  id: string;
  address: string;
  totalArea: number;
  totalRent: number;
  deposit: number;
  leaseStart: string;
  leaseEnd: string;
  paymentDay: number;
  paymentCycle: 'monthly' | 'quarterly' | 'yearly';
  roommates: Roommate[];
  landlordName?: string;
  landlordPhone?: string;
  agency?: string;
}

export type BillType = 'water' | 'electric' | 'gas' | 'internet' | 'rent' | 'other';

export interface Bill {
  id: string;
  type: BillType;
  title: string;
  amount: number;
  billingPeriod: string;
  dueDate: string;
  paid: boolean;
  paidDate?: string;
  payerId?: string;
  note?: string;
  createdAt: string;
  involvedRoommateIds?: string[];
}

export interface BillShareDetail {
  billId: string;
  roommateId: string;
  roommateName: string;
  amount: number;
  paid: boolean;
}

export interface ContractClause {
  id: string;
  title: string;
  content: string;
  category: 'rent' | 'deposit' | 'maintenance' | 'termination' | 'other';
}

export interface PublicItem {
  id: string;
  name: string;
  quantity: number;
  purchaser?: string;
  purchaseDate?: string;
  price?: number;
  note?: string;
}

export type HouseRuleCategory = 'hygiene' | 'noise' | 'visitor' | 'pet' | 'smoking' | 'other';

export interface HouseRule {
  id: string;
  content: string;
  category: HouseRuleCategory;
  createdAt: string;
}

export type IssueCategory = 'hygiene' | 'noise' | 'visitor' | 'pet' | 'rent' | 'bill' | 'other';
export type IssueStatus = 'pending' | 'resolved' | 'escalated';

export const ISSUE_CATEGORY_LABEL: Record<IssueCategory, string> = {
  hygiene: '卫生问题',
  noise: '噪音扰民',
  visitor: '访客留宿',
  pet: '宠物问题',
  bill: '费用分摊',
  rent: '房租押金',
  other: '其他争议'
};

export const ISSUE_CATEGORY_COLOR: Record<IssueCategory, string> = {
  hygiene: '#20C997',
  noise: '#FF9F43',
  visitor: '#165DFF',
  pet: '#722ED1',
  bill: '#F53F3F',
  rent: '#FF7D00',
  other: '#86909C'
};

export const ISSUE_STATUS_LABEL: Record<IssueStatus, string> = {
  pending: '待处理',
  resolved: '已解决',
  escalated: '需介入'
};

export interface ProgressLog {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  category: IssueCategory;
  title: string;
  description: string;
  status: IssueStatus;
  reportedBy: string;
  reportedAt: string;
  resolvedAt?: string;
  resolution?: string;
  attachments: string[];
  involvedParties: string[];
  progressLogs: ProgressLog[];
  internalNote?: string;
}

export type DeductionType = 'damage' | 'cleaning' | 'unpaid_bill' | 'repair' | 'other';

export interface DeductionItem {
  id: string;
  type: DeductionType;
  title: string;
  amount: number;
  description: string;
  evidence?: string[];
  disputed: boolean;
  disputeReason?: string;
}

export interface RoommateConfirmation {
  roommateId: string;
  roommateName: string;
  confirmed: boolean;
  confirmedAt?: string;
  confirmContent?: string;
}

export const DEDUCTION_TYPE_LABEL: Record<DeductionType, string> = {
  damage: '物品损坏',
  cleaning: '清洁费',
  unpaid_bill: '未缴账单',
  repair: '维修费用',
  other: '其他扣款'
};

export const DEDUCTION_TYPE_COLOR: Record<DeductionType, string> = {
  damage: '#F53F3F',
  cleaning: '#722ED1',
  unpaid_bill: '#FF7D00',
  repair: '#FF9F43',
  other: '#86909C'
};

export interface CheckoutRecord {
  id: string;
  checkoutDate: string;
  totalDeposit: number;
  deductions: DeductionItem[];
  refundAmount: number;
  confirmations: RoommateConfirmation[];
  note?: string;
  status: 'draft' | 'pending' | 'completed' | 'disputed';
}

export const BILL_TYPE_LABEL: Record<BillType, string> = {
  water: '水费',
  electric: '电费',
  gas: '燃气费',
  internet: '网费',
  rent: '房租',
  other: '其他'
};

export const BILL_TYPE_COLOR: Record<BillType, string> = {
  water: '#165DFF',
  electric: '#FF9F43',
  gas: '#F53F3F',
  internet: '#722ED1',
  rent: '#20C997',
  other: '#86909C'
};


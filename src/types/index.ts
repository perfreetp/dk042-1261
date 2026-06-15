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

export interface HouseRule {
  id: string;
  content: string;
  category: 'hygiene' | 'noise' | 'visitor' | 'pet' | 'smoking' | 'other';
  createdAt: string;
}

export type IssueCategory = 'hygiene' | 'noise' | 'visitor' | 'pet' | 'rent' | 'bill' | 'other';
export type IssueStatus = 'pending' | 'resolved' | 'escalated';

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

export interface CheckoutRecord {
  id: string;
  checkoutDate: string;
  totalDeposit: number;
  deductions: DeductionItem[];
  refundAmount: number;
  confirmedBy: string[];
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

export const ISSUE_CATEGORY_LABEL: Record<IssueCategory, string> = {
  hygiene: '卫生',
  noise: '噪音',
  visitor: '访客',
  pet: '宠物',
  rent: '房租',
  bill: '费用',
  other: '其他'
};

export const ISSUE_CATEGORY_COLOR: Record<IssueCategory, string> = {
  hygiene: '#20C997',
  noise: '#F53F3F',
  visitor: '#722ED1',
  pet: '#FF9F43',
  rent: '#165DFF',
  bill: '#FF7D00',
  other: '#86909C'
};

export const ISSUE_STATUS_LABEL: Record<IssueStatus, string> = {
  pending: '待处理',
  resolved: '已解决',
  escalated: '需介入'
};

export const DEDUCTION_TYPE_LABEL: Record<DeductionType, string> = {
  damage: '物品损坏',
  cleaning: '清洁费用',
  unpaid_bill: '未缴费用',
  repair: '维修费用',
  other: '其他扣款'
};

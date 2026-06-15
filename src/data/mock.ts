import type {
  RentalProfile,
  Bill,
  ContractClause,
  PublicItem,
  HouseRule,
  Issue,
  CheckoutRecord
} from '@/types';

export const mockRentalProfile: RentalProfile = {
  id: 'profile_001',
  address: '朝阳区望京SOHO T1 1503',
  totalArea: 98,
  totalRent: 6800,
  deposit: 13600,
  leaseStart: '2025-03-01',
  leaseEnd: '2026-02-28',
  paymentDay: 1,
  paymentCycle: 'monthly',
  landlordName: '张女士',
  landlordPhone: '138****5678',
  agency: '链家地产',
  roommates: [
    {
      id: 'rm_001',
      name: '小明',
      phone: '138****1111',
      roomArea: 18,
      shareRatio: 0.35,
      moveInDate: '2025-03-01'
    },
    {
      id: 'rm_002',
      name: '小红',
      phone: '138****2222',
      roomArea: 15,
      shareRatio: 0.32,
      moveInDate: '2025-03-01'
    },
    {
      id: 'rm_003',
      name: '小刚',
      phone: '138****3333',
      roomArea: 12,
      shareRatio: 0.33,
      moveInDate: '2025-04-15'
    }
  ]
};

export const mockBills: Bill[] = [
  {
    id: 'bill_001',
    type: 'rent',
    title: '6月份房租',
    amount: 6800,
    billingPeriod: '2025-06',
    dueDate: '2025-06-01',
    paid: true,
    paidDate: '2025-05-31',
    payerId: 'rm_001',
    createdAt: '2025-05-25T10:00:00'
  },
  {
    id: 'bill_002',
    type: 'water',
    title: '5月份水费',
    amount: 128.5,
    billingPeriod: '2025-05',
    dueDate: '2025-06-10',
    paid: true,
    paidDate: '2025-06-08',
    payerId: 'rm_002',
    createdAt: '2025-06-01T09:30:00'
  },
  {
    id: 'bill_003',
    type: 'electric',
    title: '5月份电费',
    amount: 456.8,
    billingPeriod: '2025-05',
    dueDate: '2025-06-15',
    paid: false,
    createdAt: '2025-06-05T14:20:00',
    note: '空调使用较多'
  },
  {
    id: 'bill_004',
    type: 'gas',
    title: '5月份燃气费',
    amount: 89.2,
    billingPeriod: '2025-05',
    dueDate: '2025-06-12',
    paid: true,
    paidDate: '2025-06-10',
    payerId: 'rm_003',
    createdAt: '2025-06-02T11:00:00'
  },
  {
    id: 'bill_005',
    type: 'internet',
    title: '宽带费(季度)',
    amount: 300,
    billingPeriod: '2025-Q2',
    dueDate: '2025-06-20',
    paid: false,
    createdAt: '2025-06-10T16:00:00',
    note: '200M宽带 4-6月'
  },
  {
    id: 'bill_006',
    type: 'other',
    title: '公共区域清洁费',
    amount: 150,
    billingPeriod: '2025-06',
    dueDate: '2025-06-18',
    paid: false,
    createdAt: '2025-06-12T10:15:00',
    note: '请阿姨打扫公共区域'
  },
  {
    id: 'bill_007',
    type: 'rent',
    title: '7月份房租',
    amount: 6800,
    billingPeriod: '2025-07',
    dueDate: '2025-07-01',
    paid: false,
    createdAt: '2025-06-20T08:00:00'
  }
];

export const mockContractClauses: ContractClause[] = [
  {
    id: 'clause_001',
    title: '押金退还',
    content: '合同期满，房屋及设施无损坏，水电费结清后，押金全额无息退还。如有损坏，按实际维修费用扣除。',
    category: 'deposit'
  },
  {
    id: 'clause_002',
    title: '提前解约',
    content: '任何一方提前解约需提前30天书面通知，并支付相当于一个月租金的违约金。',
    category: 'termination'
  },
  {
    id: 'clause_003',
    title: '维修责任',
    content: '房屋主体结构及原有设施自然损坏由房东承担维修；人为损坏由责任人承担。',
    category: 'maintenance'
  },
  {
    id: 'clause_004',
    title: '租金支付',
    content: '每月1日前支付当月租金，逾期按日加收0.5%滞纳金。超过7天未付，房东有权解除合同。',
    category: 'rent'
  }
];

export const mockPublicItems: PublicItem[] = [
  {
    id: 'item_001',
    name: '洗衣液',
    quantity: 2,
    purchaser: '小明',
    purchaseDate: '2025-06-01',
    price: 45.9
  },
  {
    id: 'item_002',
    name: '卫生纸',
    quantity: 5,
    purchaser: '小红',
    purchaseDate: '2025-06-05',
    price: 32.5
  },
  {
    id: 'item_003',
    name: '垃圾桶',
    quantity: 3,
    purchaser: '小刚',
    purchaseDate: '2025-05-20',
    price: 60,
    note: '每人房间各一个'
  },
  {
    id: 'item_004',
    name: '微波炉',
    quantity: 1,
    purchaser: '小明',
    purchaseDate: '2025-04-10',
    price: 399,
    note: '公共使用，退租时按折旧分摊'
  },
  {
    id: 'item_005',
    name: '洗洁精',
    quantity: 1,
    purchaser: '小红',
    purchaseDate: '2025-06-10',
    price: 15.8
  }
];

export const mockHouseRules: HouseRule[] = [
  {
    id: 'rule_001',
    content: '晚上23:00后保持安静，避免大声喧哗和播放高音量音乐',
    category: 'noise',
    createdAt: '2025-03-01T10:00:00'
  },
  {
    id: 'rule_002',
    content: '每周日进行公共区域大扫除，轮流值日',
    category: 'hygiene',
    createdAt: '2025-03-01T10:00:00'
  },
  {
    id: 'rule_003',
    content: '访客需提前告知其他室友，留宿不得超过3天',
    category: 'visitor',
    createdAt: '2025-03-01T10:00:00'
  },
  {
    id: 'rule_004',
    content: '室内禁止吸烟，阳台吸烟后请及时清理烟蒂',
    category: 'smoking',
    createdAt: '2025-03-05T14:00:00'
  },
  {
    id: 'rule_005',
    content: '厨房使用后及时清洁，餐具不过夜',
    category: 'hygiene',
    createdAt: '2025-03-10T09:30:00'
  }
];

export const mockIssues: Issue[] = [
  {
    id: 'issue_001',
    category: 'hygiene',
    title: '厨房餐具未及时清洗',
    description: '小刚使用厨房后，餐具堆在水槽两天未洗，已发臭，影响其他人使用。',
    status: 'resolved',
    reportedBy: '小红',
    reportedAt: '2025-06-05T20:30:00',
    resolvedAt: '2025-06-06T09:00:00',
    resolution: '小刚已清洗并道歉，承诺以后注意。',
    attachments: [],
    involvedParties: ['小刚', '小红']
  },
  {
    id: 'issue_002',
    category: 'noise',
    title: '深夜打游戏声音过大',
    description: '小明经常凌晨1点还在打游戏，键盘敲击声和语音聊天声严重影响睡眠。',
    status: 'pending',
    reportedBy: '小刚',
    reportedAt: '2025-06-12T08:00:00',
    attachments: [],
    involvedParties: ['小明', '小刚']
  },
  {
    id: 'issue_003',
    category: 'visitor',
    title: '频繁留宿未提前告知',
    description: '小红的朋友连续住了一周，未提前告知，导致浴室和厨房使用紧张。',
    status: 'escalated',
    reportedBy: '小明',
    reportedAt: '2025-06-15T19:00:00',
    attachments: [],
    involvedParties: ['小红', '小明', '小刚']
  },
  {
    id: 'issue_004',
    category: 'bill',
    title: '上月电费分摊有疑问',
    description: '5月份电费比4月多了200元，怀疑有人私自使用大功率电器，需要核对电表读数。',
    status: 'pending',
    reportedBy: '小刚',
    reportedAt: '2025-06-10T14:30:00',
    attachments: [],
    involvedParties: ['小明', '小红', '小刚']
  }
];

export const mockCheckoutRecord: CheckoutRecord = {
  id: 'checkout_001',
  checkoutDate: '2026-02-28',
  totalDeposit: 13600,
  deductions: [
    {
      id: 'ded_001',
      type: 'cleaning',
      title: '深度清洁费',
      amount: 500,
      description: '退租时全屋深度清洁',
      disputed: false
    },
    {
      id: 'ded_002',
      type: 'damage',
      title: '客厅墙面修补',
      amount: 300,
      description: '墙面有多处钉孔和污渍需要修补',
      disputed: true,
      disputeReason: '入住时已有部分钉孔，应按比例扣除'
    }
  ],
  refundAmount: 12800,
  confirmations: [],
  status: 'draft',
  note: '预计2月底退租，提前核对扣款项目'
};

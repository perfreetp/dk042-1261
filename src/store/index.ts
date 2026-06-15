import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type {
  RentalProfile,
  Bill,
  ContractClause,
  PublicItem,
  HouseRule,
  Issue,
  CheckoutRecord,
  Roommate,
  DeductionItem,
  RoommateConfirmation
} from '@/types';
import {
  mockRentalProfile,
  mockBills,
  mockContractClauses,
  mockPublicItems,
  mockHouseRules,
  mockIssues,
  mockCheckoutRecord
} from '@/data/mock';
import { generateId } from '@/utils';

const STORAGE_KEY = 'roommate_app_data';

interface PersistedData {
  rentalProfile: RentalProfile;
  bills: Bill[];
  contractClauses: ContractClause[];
  publicItems: PublicItem[];
  houseRules: HouseRule[];
  issues: Issue[];
  checkoutRecord: CheckoutRecord;
}

const loadPersistedData = (): PersistedData | null => {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as PersistedData;
    }
  } catch (e) {
    console.error('Failed to load persisted data:', e);
  }
  return null;
};

const persistData = (data: PersistedData) => {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to persist data:', e);
  }
};

const saved = loadPersistedData();

interface AppState {
  rentalProfile: RentalProfile;
  bills: Bill[];
  contractClauses: ContractClause[];
  publicItems: PublicItem[];
  houseRules: HouseRule[];
  issues: Issue[];
  checkoutRecord: CheckoutRecord;

  setRentalProfile: (profile: RentalProfile) => void;
  updateRentalProfile: (updates: Partial<RentalProfile>) => void;
  addRoommate: (roommate: Omit<Roommate, 'id'>) => void;
  updateRoommate: (id: string, updates: Partial<Roommate>) => void;
  removeRoommate: (id: string) => void;

  addBill: (bill: Omit<Bill, 'id' | 'createdAt'>) => void;
  updateBill: (id: string, updates: Partial<Bill>) => void;
  toggleBillPaid: (id: string) => void;
  removeBill: (id: string) => void;

  addContractClause: (clause: Omit<ContractClause, 'id'>) => void;
  updateContractClause: (id: string, updates: Partial<ContractClause>) => void;
  removeContractClause: (id: string) => void;

  addPublicItem: (item: Omit<PublicItem, 'id'>) => void;
  updatePublicItem: (id: string, updates: Partial<PublicItem>) => void;
  removePublicItem: (id: string) => void;

  addHouseRule: (rule: Omit<HouseRule, 'id' | 'createdAt'>) => void;
  updateHouseRule: (id: string, updates: Partial<HouseRule>) => void;
  removeHouseRule: (id: string) => void;

  addIssue: (issue: Omit<Issue, 'id' | 'reportedAt' | 'attachments'> & { attachments?: string[] }) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  resolveIssue: (id: string, resolution: string) => void;

  updateCheckoutRecord: (updates: Partial<CheckoutRecord>) => void;
  addDeduction: (deduction: Omit<DeductionItem, 'id'>) => void;
  updateDeduction: (id: string, updates: Partial<DeductionItem>) => void;
  removeDeduction: (id: string) => void;
  initiateCheckoutConfirm: () => void;
  confirmRoommate: (roommateId: string) => void;
  completeCheckout: () => void;
}

const getPersistableState = (state: AppState): PersistedData => ({
  rentalProfile: state.rentalProfile,
  bills: state.bills,
  contractClauses: state.contractClauses,
  publicItems: state.publicItems,
  houseRules: state.houseRules,
  issues: state.issues,
  checkoutRecord: state.checkoutRecord
});

export const useAppStore = create<AppState>((set, get) => ({
  rentalProfile: saved?.rentalProfile || mockRentalProfile,
  bills: saved?.bills || mockBills,
  contractClauses: saved?.contractClauses || mockContractClauses,
  publicItems: saved?.publicItems || mockPublicItems,
  houseRules: saved?.houseRules || mockHouseRules,
  issues: saved?.issues || mockIssues,
  checkoutRecord: saved?.checkoutRecord || mockCheckoutRecord,

  setRentalProfile: (profile) => {
    set({ rentalProfile: profile });
    persistData(getPersistableState(get()));
  },
  updateRentalProfile: (updates) => {
    set((state) => ({ rentalProfile: { ...state.rentalProfile, ...updates } }));
    persistData(getPersistableState(get()));
  },
  addRoommate: (roommate) => {
    set((state) => ({
      rentalProfile: {
        ...state.rentalProfile,
        roommates: [...state.rentalProfile.roommates, { ...roommate, id: generateId() }]
      }
    }));
    persistData(getPersistableState(get()));
  },
  updateRoommate: (id, updates) => {
    set((state) => ({
      rentalProfile: {
        ...state.rentalProfile,
        roommates: state.rentalProfile.roommates.map((r) =>
          r.id === id ? { ...r, ...updates } : r
        )
      }
    }));
    persistData(getPersistableState(get()));
  },
  removeRoommate: (id) => {
    set((state) => ({
      rentalProfile: {
        ...state.rentalProfile,
        roommates: state.rentalProfile.roommates.filter((r) => r.id !== id)
      }
    }));
    persistData(getPersistableState(get()));
  },

  addBill: (bill) => {
    set((state) => ({
      bills: [{ ...bill, id: generateId(), createdAt: new Date().toISOString() }, ...state.bills]
    }));
    persistData(getPersistableState(get()));
  },
  updateBill: (id, updates) => {
    set((state) => ({
      bills: state.bills.map((b) => (b.id === id ? { ...b, ...updates } : b))
    }));
    persistData(getPersistableState(get()));
  },
  toggleBillPaid: (id) => {
    set((state) => ({
      bills: state.bills.map((b) =>
        b.id === id
          ? { ...b, paid: !b.paid, paidDate: !b.paid ? new Date().toISOString() : undefined }
          : b
      )
    }));
    persistData(getPersistableState(get()));
  },
  removeBill: (id) => {
    set((state) => ({ bills: state.bills.filter((b) => b.id !== id) }));
    persistData(getPersistableState(get()));
  },

  addContractClause: (clause) => {
    set((state) => ({
      contractClauses: [...state.contractClauses, { ...clause, id: generateId() }]
    }));
    persistData(getPersistableState(get()));
  },
  updateContractClause: (id, updates) => {
    set((state) => ({
      contractClauses: state.contractClauses.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      )
    }));
    persistData(getPersistableState(get()));
  },
  removeContractClause: (id) => {
    set((state) => ({
      contractClauses: state.contractClauses.filter((c) => c.id !== id)
    }));
    persistData(getPersistableState(get()));
  },

  addPublicItem: (item) => {
    set((state) => ({
      publicItems: [...state.publicItems, { ...item, id: generateId() }]
    }));
    persistData(getPersistableState(get()));
  },
  updatePublicItem: (id, updates) => {
    set((state) => ({
      publicItems: state.publicItems.map((i) =>
        i.id === id ? { ...i, ...updates } : i
      )
    }));
    persistData(getPersistableState(get()));
  },
  removePublicItem: (id) => {
    set((state) => ({ publicItems: state.publicItems.filter((i) => i.id !== id) }));
    persistData(getPersistableState(get()));
  },

  addHouseRule: (rule) => {
    set((state) => ({
      houseRules: [
        ...state.houseRules,
        { ...rule, id: generateId(), createdAt: new Date().toISOString() }
      ]
    }));
    persistData(getPersistableState(get()));
  },
  updateHouseRule: (id, updates) => {
    set((state) => ({
      houseRules: state.houseRules.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      )
    }));
    persistData(getPersistableState(get()));
  },
  removeHouseRule: (id) => {
    set((state) => ({ houseRules: state.houseRules.filter((r) => r.id !== id) }));
    persistData(getPersistableState(get()));
  },

  addIssue: (issue) => {
    set((state) => ({
      issues: [
        {
          ...issue,
          id: generateId(),
          reportedAt: new Date().toISOString(),
          attachments: issue.attachments || []
        },
        ...state.issues
      ]
    }));
    persistData(getPersistableState(get()));
  },
  updateIssue: (id, updates) => {
    set((state) => ({
      issues: state.issues.map((i) => (i.id === id ? { ...i, ...updates } : i))
    }));
    persistData(getPersistableState(get()));
  },
  resolveIssue: (id, resolution) => {
    set((state) => ({
      issues: state.issues.map((i) =>
        i.id === id
          ? {
              ...i,
              status: 'resolved',
              resolution,
              resolvedAt: new Date().toISOString()
            }
          : i
      )
    }));
    persistData(getPersistableState(get()));
  },

  updateCheckoutRecord: (updates) => {
    set((state) => ({ checkoutRecord: { ...state.checkoutRecord, ...updates } }));
    persistData(getPersistableState(get()));
  },
  addDeduction: (deduction) => {
    set((state) => ({
      checkoutRecord: {
        ...state.checkoutRecord,
        deductions: [...state.checkoutRecord.deductions, { ...deduction, id: generateId() }]
      }
    }));
    persistData(getPersistableState(get()));
  },
  updateDeduction: (id, updates) => {
    set((state) => ({
      checkoutRecord: {
        ...state.checkoutRecord,
        deductions: state.checkoutRecord.deductions.map((d) =>
          d.id === id ? { ...d, ...updates } : d
        )
      }
    }));
    persistData(getPersistableState(get()));
  },
  removeDeduction: (id) => {
    set((state) => ({
      checkoutRecord: {
        ...state.checkoutRecord,
        deductions: state.checkoutRecord.deductions.filter((d) => d.id !== id)
      }
    }));
    persistData(getPersistableState(get()));
  },

  initiateCheckoutConfirm: () => {
    set((state) => {
      const confirmations: RoommateConfirmation[] = state.rentalProfile.roommates.map((rm) => ({
        roommateId: rm.id,
        roommateName: rm.name,
        confirmed: false
      }));
      return {
        checkoutRecord: {
          ...state.checkoutRecord,
          status: 'pending',
          confirmations
        }
      };
    });
    persistData(getPersistableState(get()));
  },

  confirmRoommate: (roommateId) => {
    set((state) => {
      const newConfirmations = state.checkoutRecord.confirmations.map((c) =>
        c.roommateId === roommateId
          ? { ...c, confirmed: true, confirmedAt: new Date().toISOString() }
          : c
      );
      return {
        checkoutRecord: {
          ...state.checkoutRecord,
          confirmations: newConfirmations
        }
      };
    });
    persistData(getPersistableState(get()));
  },

  completeCheckout: () => {
    set((state) => ({
      checkoutRecord: {
        ...state.checkoutRecord,
        status: 'completed'
      }
    }));
    persistData(getPersistableState(get()));
  }
}));

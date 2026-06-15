import { create } from 'zustand';
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

export const useAppStore = create<AppState>((set) => ({
  rentalProfile: mockRentalProfile,
  bills: mockBills,
  contractClauses: mockContractClauses,
  publicItems: mockPublicItems,
  houseRules: mockHouseRules,
  issues: mockIssues,
  checkoutRecord: mockCheckoutRecord,

  setRentalProfile: (profile) => set({ rentalProfile: profile }),
  updateRentalProfile: (updates) =>
    set((state) => ({ rentalProfile: { ...state.rentalProfile, ...updates } })),
  addRoommate: (roommate) =>
    set((state) => ({
      rentalProfile: {
        ...state.rentalProfile,
        roommates: [...state.rentalProfile.roommates, { ...roommate, id: generateId() }]
      }
    })),
  updateRoommate: (id, updates) =>
    set((state) => ({
      rentalProfile: {
        ...state.rentalProfile,
        roommates: state.rentalProfile.roommates.map((r) =>
          r.id === id ? { ...r, ...updates } : r
        )
      }
    })),
  removeRoommate: (id) =>
    set((state) => ({
      rentalProfile: {
        ...state.rentalProfile,
        roommates: state.rentalProfile.roommates.filter((r) => r.id !== id)
      }
    })),

  addBill: (bill) =>
    set((state) => ({
      bills: [{ ...bill, id: generateId(), createdAt: new Date().toISOString() }, ...state.bills]
    })),
  updateBill: (id, updates) =>
    set((state) => ({
      bills: state.bills.map((b) => (b.id === id ? { ...b, ...updates } : b))
    })),
  toggleBillPaid: (id) =>
    set((state) => ({
      bills: state.bills.map((b) =>
        b.id === id
          ? { ...b, paid: !b.paid, paidDate: !b.paid ? new Date().toISOString() : undefined }
          : b
      )
    })),
  removeBill: (id) =>
    set((state) => ({ bills: state.bills.filter((b) => b.id !== id) })),

  addContractClause: (clause) =>
    set((state) => ({
      contractClauses: [...state.contractClauses, { ...clause, id: generateId() }]
    })),
  updateContractClause: (id, updates) =>
    set((state) => ({
      contractClauses: state.contractClauses.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      )
    })),
  removeContractClause: (id) =>
    set((state) => ({
      contractClauses: state.contractClauses.filter((c) => c.id !== id)
    })),

  addPublicItem: (item) =>
    set((state) => ({
      publicItems: [...state.publicItems, { ...item, id: generateId() }]
    })),
  updatePublicItem: (id, updates) =>
    set((state) => ({
      publicItems: state.publicItems.map((i) =>
        i.id === id ? { ...i, ...updates } : i
      )
    })),
  removePublicItem: (id) =>
    set((state) => ({ publicItems: state.publicItems.filter((i) => i.id !== id) })),

  addHouseRule: (rule) =>
    set((state) => ({
      houseRules: [
        ...state.houseRules,
        { ...rule, id: generateId(), createdAt: new Date().toISOString() }
      ]
    })),
  updateHouseRule: (id, updates) =>
    set((state) => ({
      houseRules: state.houseRules.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      )
    })),
  removeHouseRule: (id) =>
    set((state) => ({ houseRules: state.houseRules.filter((r) => r.id !== id) })),

  addIssue: (issue) =>
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
    })),
  updateIssue: (id, updates) =>
    set((state) => ({
      issues: state.issues.map((i) => (i.id === id ? { ...i, ...updates } : i))
    })),
  resolveIssue: (id, resolution) =>
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
    })),

  updateCheckoutRecord: (updates) =>
    set((state) => ({ checkoutRecord: { ...state.checkoutRecord, ...updates } })),
  addDeduction: (deduction) =>
    set((state) => ({
      checkoutRecord: {
        ...state.checkoutRecord,
        deductions: [...state.checkoutRecord.deductions, { ...deduction, id: generateId() }]
      }
    })),
  updateDeduction: (id, updates) =>
    set((state) => ({
      checkoutRecord: {
        ...state.checkoutRecord,
        deductions: state.checkoutRecord.deductions.map((d) =>
          d.id === id ? { ...d, ...updates } : d
        )
      }
    })),
  removeDeduction: (id) =>
    set((state) => ({
      checkoutRecord: {
        ...state.checkoutRecord,
        deductions: state.checkoutRecord.deductions.filter((d) => d.id !== id)
      }
    })),

  initiateCheckoutConfirm: () =>
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
    }),

  confirmRoommate: (roommateId) =>
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
    }),

  completeCheckout: () =>
    set((state) => ({
      checkoutRecord: {
        ...state.checkoutRecord,
        status: 'completed'
      }
    }))
}));

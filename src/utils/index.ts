import dayjs from 'dayjs';

export const formatMoney = (amount: number, decimals = 2): string => {
  return `¥${amount.toFixed(decimals)}`;
};

export const formatDate = (date: string, format = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string, format = 'YYYY-MM-DD HH:mm'): string => {
  return dayjs(date).format(format);
};

export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getDaysRemaining = (dueDate: string): number => {
  const today = dayjs().startOf('day');
  const due = dayjs(dueDate).startOf('day');
  return due.diff(today, 'day');
};

export const isOverdue = (dueDate: string): boolean => {
  return getDaysRemaining(dueDate) < 0;
};

export const calculateShareAmount = (
  totalAmount: number,
  shareRatio: number
): number => {
  return Number((totalAmount * shareRatio).toFixed(2));
};

export interface RoommateShare {
  roommateId: string;
  roommateName: string;
  shareRatio: number;
  shareAmount: number;
}

export const calculateInvolvedShareAmounts = (
  totalAmount: number,
  allRoommates: { id: string; name: string; shareRatio: number }[],
  involvedIds: string[]
): RoommateShare[] => {
  const involved = allRoommates.filter((r) => involvedIds.length === 0 || involvedIds.includes(r.id));

  if (involved.length === 0) {
    return allRoommates.map((r) => ({
      roommateId: r.id,
      roommateName: r.name,
      shareRatio: r.shareRatio,
      shareAmount: 0
    }));
  }

  if (involvedIds.length === 0) {
    return allRoommates.map((r) => ({
      roommateId: r.id,
      roommateName: r.name,
      shareRatio: r.shareRatio,
      shareAmount: calculateShareAmount(totalAmount, r.shareRatio)
    }));
  }

  const totalInvolvedRatio = involved.reduce((sum, r) => sum + r.shareRatio, 0);
  const shareMap: Record<string, RoommateShare> = {};

  let allocated = 0;
  involved.forEach((r, idx) => {
    const amount = idx === involved.length - 1
      ? Number((totalAmount - allocated).toFixed(2))
      : Number((totalAmount * (r.shareRatio / totalInvolvedRatio)).toFixed(2));
    allocated += amount;
    shareMap[r.id] = {
      roommateId: r.id,
      roommateName: r.name,
      shareRatio: r.shareRatio,
      shareAmount: amount
    };
  });

  return allRoommates.map((r) => shareMap[r.id] || {
    roommateId: r.id,
    roommateName: r.name,
    shareRatio: r.shareRatio,
    shareAmount: 0
  });
};

export const validateShareRatios = (ratios: number[]): boolean => {
  const total = ratios.reduce((sum, r) => sum + r, 0);
  return Math.abs(total - 1) < 0.001;
};

export const getMonthLabel = (dateStr: string): string => {
  return dayjs(dateStr).format('YYYY年MM月');
};

export const getCurrentMonthStr = (): string => {
  return dayjs().format('YYYY-MM');
};

export const getDefaultDueDate = (daysToAdd = 10): string => {
  return dayjs().add(daysToAdd, 'day').format('YYYY-MM-DD');
};

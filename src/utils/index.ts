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

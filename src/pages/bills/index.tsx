import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { useAppStore } from '@/store';
import {
  formatMoney,
  formatDate,
  getDaysRemaining,
  isOverdue,
  calculateShareAmount,
  getMonthLabel
} from '@/utils';
import { BILL_TYPE_LABEL, BILL_TYPE_COLOR } from '@/types';
import SectionTitle from '@/components/SectionTitle';
import EmptyState from '@/components/EmptyState';
import Tag from '@/components/Tag';
import styles from './index.module.scss';
import classnames from 'classnames';

type TabType = 'all' | 'pending' | 'paid';

const BillsPage: React.FC = () => {
  const { bills, rentalProfile, toggleBillPaid } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [expandedBill, setExpandedBill] = useState<string | null>(null);

  const { roommates } = rentalProfile;

  const filteredBills = useMemo(() => {
    if (activeTab === 'all') return bills;
    if (activeTab === 'pending') return bills.filter((b) => !b.paid);
    return bills.filter((b) => b.paid);
  }, [bills, activeTab]);

  const stats = useMemo(() => {
    const pending = bills.filter((b) => !b.paid);
    const paid = bills.filter((b) => b.paid);
    return {
      pendingTotal: pending.reduce((sum, b) => sum + b.amount, 0),
      paidTotal: paid.reduce((sum, b) => sum + b.amount, 0),
      pendingCount: pending.length,
      paidCount: paid.length
    };
  }, [bills]);

  const getDueStyle = (bill: typeof bills[0]) => {
    if (bill.paid) return '';
    if (isOverdue(bill.dueDate)) return styles.billDueError;
    const days = getDaysRemaining(bill.dueDate);
    if (days <= 3) return styles.billDueWarning;
    return '';
  };

  const getDueText = (bill: typeof bills[0]) => {
    if (bill.paid) return `已缴 · ${formatDate(bill.paidDate!)}`;
    const days = getDaysRemaining(bill.dueDate);
    if (days < 0) return `已逾期 ${Math.abs(days)} 天`;
    if (days === 0) return '今天到期';
    if (days <= 3) return `还剩 ${days} 天`;
    return `到期日 ${formatDate(bill.dueDate)}`;
  };

  const toggleExpand = (billId: string) => {
    setExpandedBill(expandedBill === billId ? null : billId);
  };

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'all', label: '全部', count: bills.length },
    { key: 'pending', label: '待缴', count: stats.pendingCount },
    { key: 'paid', label: '已缴', count: stats.paidCount }
  ];

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.summary}>
        <Text className={styles.summaryTitle}>本月待缴总额</Text>
        <Text className={styles.summaryAmount}>{formatMoney(stats.pendingTotal)}</Text>
        <View className={styles.summaryStats}>
          <View className={styles.summaryStat}>
            <Text className={styles.summaryStatValue}>{stats.pendingCount}</Text>
            <Text className={styles.summaryStatLabel}>待缴账单</Text>
          </View>
          <View className={styles.summaryStat}>
            <Text className={styles.summaryStatValue}>{formatMoney(stats.paidTotal)}</Text>
            <Text className={styles.summaryStatLabel}>已缴金额</Text>
          </View>
        </View>
      </View>

      <View className={styles.tabs}>
        {tabs.map((tab) => (
          <Text
            key={tab.key}
            className={classnames(styles.tab, activeTab === tab.key && styles.tabActive)}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label} ({tab.count})
          </Text>
        ))}
      </View>

      <View className={styles.contentArea}>
        {filteredBills.length === 0 ? (
          <EmptyState icon="💰" title="暂无账单" description="点击右下角添加账单" />
        ) : (
          filteredBills.map((bill) => (
            <View key={bill.id} className={styles.billCard}>
              <View className={styles.billHeader}>
                <View
                  className={styles.billTypeTag}
                  style={{ backgroundColor: BILL_TYPE_COLOR[bill.type] }}
                >
                  <Text>{BILL_TYPE_LABEL[bill.type]}</Text>
                </View>
                <Text className={styles.billTitle}>{bill.title}</Text>
                <Text className={styles.billAmount}>{formatMoney(bill.amount)}</Text>
              </View>

              {bill.note && (
                <Text style={{ fontSize: 24, color: '#86909C', marginBottom: 16 }}>
                  💡 {bill.note}
                </Text>
              )}

              <View className={styles.billMeta}>
                <View className={styles.billInfo}>
                  <Text className={styles.billPeriod}>
                    账期：{getMonthLabel(bill.billingPeriod)}
                  </Text>
                  <Text className={classnames(styles.billDue, getDueStyle(bill))}>
                    {bill.paid ? '✅ ' : '⏰ '}
                    {getDueText(bill)}
                  </Text>
                </View>
                <View className={styles.billActions}>
                  <Text
                    className={classnames(styles.btn, styles.btnOutline)}
                    onClick={() => toggleExpand(bill.id)}
                  >
                    {expandedBill === bill.id ? '收起明细' : '分摊明细'}
                  </Text>
                  {!bill.paid && (
                    <Text
                      className={classnames(styles.btn, styles.btnPrimary)}
                      onClick={() => toggleBillPaid(bill.id)}
                    >
                      标记已缴
                    </Text>
                  )}
                  {bill.paid && <Text className={styles.paidBadge}>✓ 已缴费</Text>}
                </View>
              </View>

              {expandedBill === bill.id && (
                <View className={styles.shareSection}>
                  <View className={styles.shareTitleRow}>
                    <Text className={styles.shareTitle}>人均分摊</Text>
                    <Text className={styles.shareTotal}>
                      合计 {formatMoney(bill.amount)}
                    </Text>
                  </View>
                  {roommates.map((rm) => (
                    <View key={rm.id} className={styles.shareItem}>
                      <View className={styles.sharePerson}>
                        <View className={styles.shareAvatar}>
                          <Text className={styles.shareAvatarText}>
                            {rm.name.charAt(0)}
                          </Text>
                        </View>
                        <Text className={styles.shareName}>{rm.name}</Text>
                        <Tag type="default">{(rm.shareRatio * 100).toFixed(0)}%</Tag>
                      </View>
                      <Text className={styles.shareAmount}>
                        {formatMoney(calculateShareAmount(bill.amount, rm.shareRatio))}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </View>

      <View className={styles.fab}>
        <Text className={styles.fabIcon}>+</Text>
      </View>
    </ScrollView>
  );
};

export default BillsPage;

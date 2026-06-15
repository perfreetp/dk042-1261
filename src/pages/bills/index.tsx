import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { useAppStore } from '@/store';
import {
  formatMoney,
  formatDate,
  getDaysRemaining,
  isOverdue,
  calculateShareAmount,
  getMonthLabel,
  getCurrentMonthStr
} from '@/utils';
import {
  BILL_TYPE_LABEL,
  BILL_TYPE_COLOR,
  type BillType,
  type Bill
} from '@/types';
import SectionTitle from '@/components/SectionTitle';
import EmptyState from '@/components/EmptyState';
import Tag from '@/components/Tag';
import Modal from '@/components/Modal';
import { FormField, FormInput, FormPicker, FormTextarea } from '@/components/FormField';
import styles from './index.module.scss';
import classnames from 'classnames';
import dayjs from 'dayjs';

type TabType = 'all' | 'pending' | 'paid';

const emptyBill: Omit<Bill, 'id' | 'createdAt'> = {
  type: 'electric',
  title: '',
  amount: 0,
  billingPeriod: getCurrentMonthStr(),
  dueDate: dayjs().add(10, 'day').format('YYYY-MM-DD'),
  paid: false,
  note: ''
};

const billTypeOptions = Object.entries(BILL_TYPE_LABEL).map(([value, label]) => ({
  label,
  value
}));

const BillsPage: React.FC = () => {
  const { bills, rentalProfile, toggleBillPaid, addBill } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [expandedBill, setExpandedBill] = useState<string | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [billForm, setBillForm] = useState<Omit<Bill, 'id' | 'createdAt'>>(emptyBill);
  const [billErrors, setBillErrors] = useState<Record<string, string>>({});

  const { roommates } = rentalProfile;

  const filteredBills = useMemo(() => {
    let result = [...bills];
    if (activeTab === 'pending') result = result.filter((b) => !b.paid);
    if (activeTab === 'paid') result = result.filter((b) => b.paid);
    return result.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
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

  const getDueStyle = (bill: Bill) => {
    if (bill.paid) return '';
    if (isOverdue(bill.dueDate)) return styles.billDueError;
    const days = getDaysRemaining(bill.dueDate);
    if (days <= 3) return styles.billDueWarning;
    return '';
  };

  const getDueText = (bill: Bill) => {
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

  const openAddBill = () => {
    setBillForm({ ...emptyBill });
    setBillErrors({});
    setAddModalVisible(true);
  };

  const handleTypeChange = (type: string) => {
    const billType = type as BillType;
    setBillForm({
      ...billForm,
      type: billType,
      title: billForm.title || BILL_TYPE_LABEL[billType]
    });
  };

  const saveBill = () => {
    const errors: Record<string, string> = {};
    if (!billForm.title.trim()) errors.title = '请输入账单标题';
    if (!billForm.amount || billForm.amount <= 0) errors.amount = '请输入有效金额';
    if (!billForm.billingPeriod) errors.billingPeriod = '请选择账期';
    if (!billForm.dueDate) errors.dueDate = '请选择到期日';

    if (Object.keys(errors).length > 0) {
      setBillErrors(errors);
      return;
    }

    addBill(billForm);
    setAddModalVisible(false);
    setActiveTab('all');
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

      <View className={styles.fab} onClick={openAddBill}>
        <Text className={styles.fabIcon}>+</Text>
      </View>

      <Modal
        visible={addModalVisible}
        title="添加费用账单"
        onClose={() => setAddModalVisible(false)}
        onConfirm={saveBill}
        confirmText="保存"
      >
        <FormField label="费用类型" required>
          <FormPicker
            value={billForm.type}
            onChange={handleTypeChange}
            options={billTypeOptions}
          />
        </FormField>

        <FormField label="账单标题" required error={billErrors.title}>
          <FormInput
            value={billForm.title}
            onChange={(v) => setBillForm({ ...billForm, title: v })}
            placeholder="如：6月份电费"
          />
        </FormField>

        <FormField label="费用金额(元)" required error={billErrors.amount}>
          <FormInput
            value={String(billForm.amount || '')}
            onChange={(v) => setBillForm({ ...billForm, amount: Number(v) })}
            placeholder="请输入金额"
            type="digit"
          />
        </FormField>

        <View style={{ display: 'flex', gap: 16 }}>
          <FormField label="账期月份" required error={billErrors.billingPeriod} style={{ flex: 1 }}>
            <FormInput
              value={billForm.billingPeriod}
              onChange={(v) => setBillForm({ ...billForm, billingPeriod: v })}
              placeholder="YYYY-MM"
            />
          </FormField>
          <FormField label="到期日期" required error={billErrors.dueDate} style={{ flex: 1 }}>
            <FormInput
              value={billForm.dueDate}
              onChange={(v) => setBillForm({ ...billForm, dueDate: v })}
              placeholder="YYYY-MM-DD"
            />
          </FormField>
        </View>

        <FormField label="备注说明">
          <FormTextarea
            value={billForm.note || ''}
            onChange={(v) => setBillForm({ ...billForm, note: v })}
            placeholder="选填，如抄表读数等"
            maxLength={200}
          />
        </FormField>

        <View style={{ marginTop: 16, padding: 16, backgroundColor: '#F7F9FC', borderRadius: 12 }}>
          <Text style={{ fontSize: 24, color: '#4E5969', marginBottom: 8 }}>
            📊 分摊预览（按室友比例自动计算）
          </Text>
          {roommates.map((rm) => (
            <View
              key={rm.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 0',
                fontSize: 24,
                color: '#4E5969'
              }}
            >
              <Text>{rm.name} ({(rm.shareRatio * 100).toFixed(0)}%)</Text>
              <Text>
                {formatMoney(calculateShareAmount(billForm.amount || 0, rm.shareRatio))}
              </Text>
            </View>
          ))}
        </View>
      </Modal>
    </ScrollView>
  );
};

export default BillsPage;

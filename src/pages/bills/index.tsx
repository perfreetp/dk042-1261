import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { useAppStore } from '@/store';
import {
  formatMoney,
  formatDate,
  getDaysRemaining,
  isOverdue,
  calculateInvolvedShareAmounts,
  getMonthLabel,
  getCurrentMonthStr,
  getDefaultDueDate
} from '@/utils';
import {
  BILL_TYPE_LABEL,
  BILL_TYPE_COLOR,
  type BillType,
  type Bill
} from '@/types';
import EmptyState from '@/components/EmptyState';
import Tag from '@/components/Tag';
import Modal from '@/components/Modal';
import { FormField, FormInput, FormPicker, FormTextarea, FormCheckboxGroup } from '@/components/FormField';
import styles from './index.module.scss';
import classnames from 'classnames';

type TabType = 'all' | 'pending' | 'paid';

const emptyBill: Omit<Bill, 'id' | 'createdAt'> = {
  type: 'electric',
  title: '',
  amount: 0,
  billingPeriod: getCurrentMonthStr(),
  dueDate: getDefaultDueDate(),
  paid: false,
  note: '',
  involvedRoommateIds: []
};

const billTypeOptions = Object.entries(BILL_TYPE_LABEL).map(([value, label]) => ({
  label,
  value
}));

const BillsPage: React.FC = () => {
  const { bills, rentalProfile, toggleBillPaid, addBill } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [billForm, setBillForm] = useState<Omit<Bill, 'id' | 'createdAt'>>(emptyBill);
  const [billErrors, setBillErrors] = useState<Record<string, string>>({});
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const { roommates } = rentalProfile;

  const roommateOptions = roommates.map((rm) => ({
    label: rm.name,
    value: rm.id
  }));

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
    if (bill.paid) return `已缴，${formatDate(bill.paidDate!)}`;
    if (isOverdue(bill.dueDate)) return `逾期 ${Math.abs(getDaysRemaining(bill.dueDate))} 天`;
    const days = getDaysRemaining(bill.dueDate);
    if (days === 0) return '今日到期';
    return `剩余 ${days} 天`;
  };

  const openAddBill = () => {
    setBillForm({ ...emptyBill, involvedRoommateIds: roommates.map((r) => r.id) });
    setBillErrors({});
    setAddModalVisible(true);
  };

  const openDetail = (bill: Bill) => {
    setSelectedBill(bill);
    setDetailModalVisible(true);
  };

  const saveBill = () => {
    const errors: Record<string, string> = {};
    if (!billForm.title.trim()) errors.title = '请输入账单名称';
    if (!billForm.amount || billForm.amount <= 0) errors.amount = '请输入有效金额';
    if (!billForm.billingPeriod.trim()) errors.billingPeriod = '请选择账期月份';
    if (!billForm.dueDate.trim()) errors.dueDate = '请选择缴费截止日';
    if (billForm.involvedRoommateIds?.length === 0) errors.involvedRoommateIds = '请选择参与分摊的室友';

    if (Object.keys(errors).length > 0) {
      setBillErrors(errors);
      return false;
    }

    const newBill: Omit<Bill, 'id' | 'createdAt'> = {
      ...billForm,
      involvedRoommateIds: billForm.involvedRoommateIds?.length === roommates.length
        ? undefined
        : billForm.involvedRoommateIds
    };
    addBill(newBill);
  };

  const handleTogglePaid = (bill: Bill) => {
    toggleBillPaid(bill.id);
    setSelectedBill(bills.find((b) => b.id === bill.id) || null);
  };

  const getPreviewShares = () => {
    const involvedIds = billForm.involvedRoommateIds?.length ? billForm.involvedRoommateIds : roommates.map((r) => r.id);
    return calculateInvolvedShareAmounts(
      billForm.amount || 0,
      roommates,
      involvedIds
    );
  };

  const getBillShares = (bill: Bill) => {
    const involvedIds = bill.involvedRoommateIds?.length ? bill.involvedRoommateIds : roommates.map((r) => r.id);
    return calculateInvolvedShareAmounts(bill.amount, roommates, involvedIds);
  };

  const previewShares = getPreviewShares();
  const selectedBillShares = selectedBill ? getBillShares(selectedBill) : [];

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.pageHeader}>
        <Text className={styles.pageTitle}>💡 账单分摊</Text>
        <Text className={styles.pageDesc}>记录水电燃网，智能均分费用</Text>
      </View>

      <View className={styles.summaryRow}>
        <View className={styles.summaryCard}>
          <Text className={styles.summaryLabel}>待缴</Text>
          <Text className={classnames(styles.summaryValue, styles.summaryPending)}>
            ¥{formatMoney(stats.pendingTotal)}
          </Text>
          <Text className={styles.summaryCount}>{stats.pendingCount} 笔</Text>
        </View>
        <View className={styles.summaryCard}>
          <Text className={styles.summaryLabel}>已缴</Text>
          <Text className={classnames(styles.summaryValue, styles.summaryPaid)}>
            ¥{formatMoney(stats.paidTotal)}
          </Text>
          <Text className={styles.summaryCount}>{stats.paidCount} 笔</Text>
        </View>
      </View>

      <View className={styles.tabBar}>
        <Text
          className={classnames(styles.tabItem, activeTab === 'all' && styles.tabActive)}
          onClick={() => setActiveTab('all')}
        >
          全部
        </Text>
        <Text
          className={classnames(styles.tabItem, activeTab === 'pending' && styles.tabActive)}
          onClick={() => setActiveTab('pending')}
        >
          待缴 {stats.pendingCount > 0 && <Text className={styles.tabBadge}>{stats.pendingCount}</Text>}
        </Text>
        <Text
          className={classnames(styles.tabItem, activeTab === 'paid' && styles.tabActive)}
          onClick={() => setActiveTab('paid')}
        >
          已缴 {stats.paidCount > 0 && <Text className={styles.tabBadge}>{stats.paidCount}</Text>}
        </Text>
      </View>

      <View className={styles.contentArea}>
        {filteredBills.length === 0 ? (
          <EmptyState icon="💰" title="暂无账单" description="点击右下角添加新账单" />
        ) : (
          filteredBills.map((bill) => {
            const involved = bill.involvedRoommateIds?.length
              ? roommates.filter((r) => bill.involvedRoommateIds?.includes(r.id))
              : roommates;
            return (
              <View key={bill.id} className={styles.billCard} onClick={() => openDetail(bill)}>
                <View className={styles.billHeader}>
                  <View
                    className={styles.billType}
                    style={{ backgroundColor: BILL_TYPE_COLOR[bill.type] }}
                  >
                    <Text>{BILL_TYPE_LABEL[bill.type]}</Text>
                  </View>
                  <Text className={styles.billAmount}>¥{formatMoney(bill.amount)}</Text>
                </View>
                <Text className={styles.billTitle}>{bill.title}</Text>
                <View className={styles.billMeta}>
                  <Text className={styles.billPeriod}>{getMonthLabel(bill.billingPeriod)}</Text>
                  {bill.involvedRoommateIds?.length && bill.involvedRoommateIds.length < roommates.length && (
                    <Tag type="warning">
                      {involved.length}人分摊
                    </Tag>
                  )}
                  {!bill.involvedRoommateIds?.length || bill.involvedRoommateIds.length === roommates.length ? (
                    <Tag type="primary">
                      全员分摊
                    </Tag>
                  ) : null}
                </View>
                <View className={styles.billFooter}>
                  <View className={classnames(styles.billDue, getDueStyle(bill))}>
                    <Text>{getDueText(bill)}</Text>
                  </View>
                  {bill.paid ? (
                    <Text className={styles.paidBadge}>✓ 已缴纳</Text>
                  ) : (
                    <Text
                      className={styles.payBtn}
                      onClick={(e) => { e.stopPropagation(); handleTogglePaid(bill); }}
                    >
                      标记已缴
                    </Text>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>

      <View className={styles.fab} onClick={openAddBill}>
        <Text className={styles.fabIcon}>+</Text>
      </View>

      <Modal
        visible={addModalVisible}
        title="添加账单"
        onClose={() => setAddModalVisible(false)}
        onConfirm={saveBill}
        confirmText="保存账单"
      >
        <FormField label="账单类型" required>
          <FormPicker
            value={billForm.type}
            onChange={(v) => setBillForm({ ...billForm, type: v as BillType })}
            options={billTypeOptions}
          />
        </FormField>

        <FormField label="账单名称" required error={billErrors.title}>
          <FormInput
            value={billForm.title}
            onChange={(v) => setBillForm({ ...billForm, title: v })}
            placeholder="如：5月份电费"
          />
        </FormField>

        <FormField label="账单金额(元)" required error={billErrors.amount}>
          <FormInput
            value={String(billForm.amount || '')}
            onChange={(v) => setBillForm({ ...billForm, amount: Number(v) })}
            placeholder="请输入金额"
            type="digit"
          />
        </FormField>

        <FormField label="账期月份" required error={billErrors.billingPeriod}>
          <FormInput
            value={billForm.billingPeriod}
            onChange={(v) => setBillForm({ ...billForm, billingPeriod: v })}
            placeholder="如：2025-06"
          />
        </FormField>

        <FormField label="缴费截止日" required error={billErrors.dueDate}>
          <FormInput
            value={billForm.dueDate}
            onChange={(v) => setBillForm({ ...billForm, dueDate: v })}
            placeholder="如：2025-06-15"
          />
        </FormField>

        <FormField label="参与分摊室友" required error={billErrors.involvedRoommateIds}>
          <FormCheckboxGroup
            value={billForm.involvedRoommateIds || []}
            onChange={(v) => setBillForm({ ...billForm, involvedRoommateIds: v })}
            options={roommateOptions}
          />
        </FormField>

        {billForm.amount > 0 && previewShares.some((s) => s.shareAmount > 0) && (
          <View className={styles.previewShareBox}>
            <Text className={styles.previewShareTitle}>📊 分摊预览</Text>
            {previewShares.map((s) => s.shareAmount > 0 && (
              <View key={s.roommateId} className={styles.previewShareItem}>
                <Text className={styles.previewShareName}>
                  {s.roommateName}
                  <Text className={styles.previewShareRatio}>
                    ({billForm.involvedRoommateIds?.length
                      ? `${(s.shareRatio * 100 /
                          roommates.filter((r) => billForm.involvedRoommateIds?.includes(r.id))
                            .reduce((sum, r) => sum + r.shareRatio, 0)
                        ).toFixed(1)}% 占比)`
                      : `${(s.shareRatio * 100).toFixed(1)}%`})
                  </Text>
                </Text>
                <Text className={styles.previewShareAmount}>¥{formatMoney(s.shareAmount)}</Text>
              </View>
            ))}
            <View className={styles.previewShareTotal}>
              <Text className={styles.previewShareTotalLabel}>合计</Text>
              <Text className={styles.previewShareTotalAmount}>¥{formatMoney(billForm.amount)}</Text>
            </View>
          </View>
        )}

        <FormField label="备注">
          <FormTextarea
            value={billForm.note || ''}
            onChange={(v) => setBillForm({ ...billForm, note: v })}
            placeholder="选填，补充说明"
            maxLength={100}
          />
        </FormField>
      </Modal>

      <Modal
        visible={detailModalVisible}
        title="账单详情"
        onClose={() => setDetailModalVisible(false)}
        showFooter={false}
      >
        {selectedBill && (
          <View className={styles.detailCard}>
            <View className={styles.detailHeader}>
              <View
                className={styles.detailTypeTag}
                style={{ backgroundColor: BILL_TYPE_COLOR[selectedBill.type] }}
              >
                <Text className={styles.detailTypeText}>{BILL_TYPE_LABEL[selectedBill.type]}</Text>
              </View>
              {selectedBill.paid ? (
                <Tag type="success">已缴纳</Tag>
              ) : (
                <Tag type="warning">待缴费</Tag>
              )}
            </View>
            <Text className={styles.detailTitle}>{selectedBill.title}</Text>
            <Text className={styles.detailAmount}>¥{formatMoney(selectedBill.amount)}</Text>

            <View className={styles.detailInfoBox}>
              <View className={styles.detailInfoRow}>
                <Text className={styles.detailInfoLabel}>账期</Text>
                <Text className={styles.detailInfoValue}>{getMonthLabel(selectedBill.billingPeriod)}</Text>
              </View>
              <View className={styles.detailInfoRow}>
                <Text className={styles.detailInfoLabel}>截止日</Text>
                <Text className={styles.detailInfoValue}>{formatDate(selectedBill.dueDate)}</Text>
              </View>
              <View className={styles.detailInfoRow}>
                <Text className={styles.detailInfoLabel}>缴费状态</Text>
                <Text className={styles.detailInfoValue}>{getDueText(selectedBill)}</Text>
              </View>
              <View className={styles.detailInfoRow}>
                <Text className={styles.detailInfoLabel}>参与分摊</Text>
                <Text className={styles.detailInfoValue}>
                  {selectedBillShares.filter((s) => s.shareAmount > 0).length} 位室友
                </Text>
              </View>
            </View>

            <View className={styles.detailShareBox}>
              <Text className={styles.detailShareTitle}>📊 分摊明细</Text>
              {selectedBillShares.map((s) => (
                <View
                  key={s.roommateId}
                  className={classnames(
                    styles.detailShareItem,
                    s.shareAmount === 0 && styles.detailShareItemSkip
                  )}
                >
                  <Text className={styles.detailShareName}>{s.roommateName}</Text>
                  <Text className={styles.detailShareAmount}>
                    {s.shareAmount > 0 ? `¥${formatMoney(s.shareAmount)}` : '不参与'}
                  </Text>
                </View>
              ))}
              <View className={styles.detailShareTotal}>
                <Text className={styles.detailShareTotalLabel}>合计</Text>
                <Text className={styles.detailShareTotalAmount}>¥{formatMoney(selectedBill.amount)}</Text>
              </View>
            </View>

            {selectedBill.note && (
              <View className={styles.detailNoteBox}>
                <Text className={styles.detailNoteLabel}>📝 备注说明</Text>
                <Text className={styles.detailNote}>{selectedBill.note}</Text>
              </View>
            )}

            {!selectedBill.paid ? (
              <Text
                className={classnames(styles.btn, styles.btnPrimary, styles.detailPayBtn)}
                onClick={() => handleTogglePaid(selectedBill)}
              >
                ✓ 标记为已缴费
              </Text>
            ) : (
              <Text
                className={classnames(styles.btn, styles.btnOutline, styles.detailPayBtn)}
                onClick={() => handleTogglePaid(selectedBill)}
              >
                撤销已缴状态
              </Text>
            )}
          </View>
        )}
      </Modal>
    </ScrollView>
  );
};

export default BillsPage;

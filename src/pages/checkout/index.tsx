import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { useAppStore } from '@/store';
import { formatMoney, formatDate } from '@/utils';
import { DEDUCTION_TYPE_LABEL } from '@/types';
import EmptyState from '@/components/EmptyState';
import styles from './index.module.scss';
import classnames from 'classnames';

const STATUS_LABEL: Record<string, string> = {
  draft: '草稿',
  pending: '待确认',
  completed: '已完成',
  disputed: '有争议'
};

const STATUS_CLASS: Record<string, string> = {
  draft: styles.statusDraft,
  pending: styles.statusPending,
  completed: styles.statusCompleted,
  disputed: styles.statusDisputed
};

const CheckoutPage: React.FC = () => {
  const { checkoutRecord, rentalProfile } = useAppStore();
  const { deductions, totalDeposit, refundAmount, status, checkoutDate, note } = checkoutRecord;
  const { roommates } = rentalProfile;

  const totalDeduction = useMemo(
    () => deductions.reduce((sum, d) => sum + d.amount, 0),
    [deductions]
  );

  const disputedCount = useMemo(
    () => deductions.filter((d) => d.disputed).length,
    [deductions]
  );

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.pageHeader}>
        <Text className={styles.pageTitle}>📦 搬离清算</Text>
        <Text className={styles.pageDesc}>核对押金扣款，顺利完成退租</Text>
      </View>

      <View className={styles.summaryCard}>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>押金总额</Text>
          <Text className={styles.summaryValue}>{formatMoney(totalDeposit)}</Text>
        </View>
        <View className={styles.summaryDivider} />
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>扣款合计</Text>
          <Text className={styles.summaryValue} style={{ color: '#F53F3F' }}>
            -{formatMoney(totalDeduction)}
          </Text>
        </View>
        <View className={styles.summaryDivider} />
        <View className={styles.refundRow}>
          <Text className={styles.refundLabel}>预计退还</Text>
          <Text className={styles.refundValue}>{formatMoney(refundAmount)}</Text>
        </View>
        <View className={styles.summaryRow} style={{ paddingTop: 0 }}>
          <Text className={styles.summaryLabel}>清算状态</Text>
          <Text className={classnames(styles.statusBadge, STATUS_CLASS[status])}>
            {STATUS_LABEL[status]}
          </Text>
        </View>
      </View>

      <View className={styles.contentArea}>
        <View className={styles.sectionHeader}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📝</Text>
            <Text className={styles.sectionTitleText}>扣款明细</Text>
          </View>
          <Text className={styles.addAction}>+ 添加扣款</Text>
        </View>

        {deductions.length === 0 ? (
          <EmptyState icon="💸" title="暂无扣款记录" description="退租清算时添加扣款项目" />
        ) : (
          <View className={styles.deductionCard}>
            {deductions.map((d) => (
              <View key={d.id} className={styles.deductionItem}>
                <View className={styles.deductionHeader}>
                  <Text className={styles.deductionType}>
                    {DEDUCTION_TYPE_LABEL[d.type]}
                  </Text>
                  <Text className={styles.deductionAmount}>-{formatMoney(d.amount)}</Text>
                </View>
                <Text className={styles.deductionTitle}>{d.title}</Text>
                <Text className={styles.deductionDesc}>{d.description}</Text>
                {d.disputed && (
                  <>
                    <Text className={styles.disputeTag}>⚠️ 存在争议</Text>
                    {d.disputeReason && (
                      <View className={styles.disputeReason}>
                        <Text>争议理由：{d.disputeReason}</Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            ))}
            <View className={styles.totalDeduction}>
              <Text className={styles.totalDeductionLabel}>扣款合计</Text>
              <Text className={styles.totalDeductionValue}>-{formatMoney(totalDeduction)}</Text>
            </View>
            {disputedCount > 0 && (
              <Text style={{ marginTop: 16, fontSize: 24, color: '#FF7D00' }}>
                ⚠️ 有 {disputedCount} 项扣款存在争议，请协商解决
              </Text>
            )}
          </View>
        )}

        <View className={styles.sectionHeader}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📅</Text>
            <Text className={styles.sectionTitleText}>清算信息</Text>
          </View>
        </View>

        <View className={styles.infoCard}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>预计退租日期</Text>
            <Text className={styles.infoValue}>{formatDate(checkoutDate)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>涉及室友</Text>
            <Text className={styles.infoValue}>{roommates.length} 人</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>人均退还</Text>
            <Text className={styles.infoValue} style={{ color: '#00B42A' }}>
              {formatMoney(refundAmount / roommates.length)}
            </Text>
          </View>
          {note && (
            <View className={styles.noteBox}>
              <Text className={styles.noteLabel}>📝 备注说明</Text>
              <Text className={styles.noteContent}>{note}</Text>
            </View>
          )}
        </View>

        <View className={styles.sectionHeader}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>✅</Text>
            <Text className={styles.sectionTitleText}>清算确认</Text>
          </View>
        </View>

        <View className={styles.infoCard}>
          {roommates.map((rm, idx) => (
            <View key={rm.id} className={styles.infoRow}>
              <Text className={styles.infoLabel}>{rm.name}</Text>
              <Text
                className={styles.infoValue}
                style={{
                  color: checkoutRecord.confirmedBy.includes(rm.id) ? '#00B42A' : '#86909C'
                }}
              >
                {checkoutRecord.confirmedBy.includes(rm.id) ? '✓ 已确认' : '待确认'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.actionBar}>
        <Text className={classnames(styles.btn, styles.btnOutline)}>
          导出清单
        </Text>
        <Text className={classnames(styles.btn, styles.btnPrimary)}>
          发起清算确认
        </Text>
      </View>
    </ScrollView>
  );
};

export default CheckoutPage;

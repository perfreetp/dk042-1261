import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store';
import { formatMoney, formatDate } from '@/utils';
import { DEDUCTION_TYPE_LABEL, type DeductionType } from '@/types';
import EmptyState from '@/components/EmptyState';
import Modal from '@/components/Modal';
import { FormField, FormInput, FormPicker, FormTextarea } from '@/components/FormField';
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

const deductionTypeOptions = Object.entries(DEDUCTION_TYPE_LABEL).map(([value, label]) => ({
  label,
  value
}));

const emptyDeduction = {
  type: 'damage' as DeductionType,
  title: '',
  amount: 0,
  description: '',
  disputed: false,
  disputeReason: ''
};

const CheckoutPage: React.FC = () => {
  const {
    checkoutRecord,
    rentalProfile,
    addDeduction,
    updateDeduction,
    removeDeduction,
    initiateCheckoutConfirm,
    confirmRoommate,
    completeCheckout
  } = useAppStore();
  const { deductions, totalDeposit, status, checkoutDate, note, confirmations } = checkoutRecord;
  const { roommates } = rentalProfile;

  const [addDeductionVisible, setAddDeductionVisible] = useState(false);
  const [disputeModalVisible, setDisputeModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [deductionForm, setDeductionForm] = useState(emptyDeduction);
  const [editingDeductionId, setEditingDeductionId] = useState<string | null>(null);
  const [deductionErrors, setDeductionErrors] = useState<Record<string, string>>({});
  const [disputeReason, setDisputeReason] = useState('');
  const [selectedDeductionId, setSelectedDeductionId] = useState<string | null>(null);

  const totalDeduction = useMemo(
    () => deductions.reduce((sum, d) => sum + d.amount, 0),
    [deductions]
  );

  const disputedCount = useMemo(
    () => deductions.filter((d) => d.disputed).length,
    [deductions]
  );

  const calculatedRefund = useMemo(
    () => Math.max(0, totalDeposit - totalDeduction),
    [totalDeposit, totalDeduction]
  );

  const confirmedCount = useMemo(
    () => confirmations.filter((c) => c.confirmed).length,
    [confirmations]
  );

  const allConfirmed = useMemo(
    () => confirmations.length > 0 && confirmedCount === confirmations.length,
    [confirmations, confirmedCount]
  );

  const getConfirmation = (roommateId: string) => {
    return confirmations.find((c) => c.roommateId === roommateId);
  };

  const openAddDeduction = () => {
    setDeductionForm({ ...emptyDeduction });
    setDeductionErrors({});
    setEditingDeductionId(null);
    setAddDeductionVisible(true);
  };

  const openEditDeduction = (d: any) => {
    setDeductionForm({
      type: d.type,
      title: d.title,
      amount: d.amount,
      description: d.description,
      disputed: d.disputed,
      disputeReason: d.disputeReason || ''
    });
    setDeductionErrors({});
    setEditingDeductionId(d.id);
    setAddDeductionVisible(true);
  };

  const openDisputeModal = (deductionId: string) => {
    setSelectedDeductionId(deductionId);
    const deduction = deductions.find((d) => d.id === deductionId);
    setDisputeReason(deduction?.disputeReason || '');
    setDisputeModalVisible(true);
  };

  const openExportModal = () => {
    setExportModalVisible(true);
  };

  const openConfirmModal = () => {
    setConfirmModalVisible(true);
  };

  const saveDeduction = () => {
    const errors: Record<string, string> = {};
    if (!deductionForm.title.trim()) errors.title = '请输入扣款名称';
    if (!deductionForm.amount || deductionForm.amount <= 0) errors.amount = '请输入有效金额';
    if (!deductionForm.description.trim()) errors.description = '请输入扣款说明';

    if (Object.keys(errors).length > 0) {
      setDeductionErrors(errors);
      return;
    }

    if (editingDeductionId) {
      updateDeduction(editingDeductionId, deductionForm);
    } else {
      addDeduction(deductionForm);
    }
    setAddDeductionVisible(false);
  };

  const handleToggleDispute = () => {
    if (selectedDeductionId) {
      const deduction = deductions.find((d) => d.id === selectedDeductionId);
      if (deduction) {
        updateDeduction(selectedDeductionId, {
          disputed: !deduction.disputed,
          disputeReason: !deduction.disputed ? disputeReason : undefined
        });
      }
    }
    setDisputeModalVisible(false);
  };

  const handleRemoveDeduction = async (id: string) => {
    const res = await Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条扣款记录吗？'
    });
    if (res.confirm) {
      removeDeduction(id);
    }
  };

  const handleInitiateConfirm = () => {
    initiateCheckoutConfirm();
    Taro.showToast({ title: '已发起确认，请室友点击确认', icon: 'none', duration: 2000 });
    setConfirmModalVisible(false);
  };

  const handleConfirmRoommate = async (roommateId: string, roommateName: string) => {
    const res = await Taro.showModal({
      title: '确认清算',
      content: `确定 ${roommateName} 要确认清算吗？确认后将无法修改。`
    });
    if (res.confirm) {
      confirmRoommate(roommateId);
      const newConfirmedCount = confirmedCount + 1;
      if (newConfirmedCount === confirmations.length) {
        setTimeout(async () => {
          const res2 = await Taro.showModal({
            title: '全部确认',
            content: '所有室友已确认！是否完成清算？'
          });
          if (res2.confirm) {
            completeCheckout();
            Taro.showToast({ title: '清算已完成！押金将按约定退还', icon: 'none', duration: 2000 });
          }
        }, 500);
      }
    }
  };

  const handleCompleteCheckout = async () => {
    const res = await Taro.showModal({
      title: '确认完成',
      content: '确定完成清算吗？完成后将无法修改任何内容。'
    });
    if (res.confirm) {
      completeCheckout();
      Taro.showToast({ title: '清算已完成！押金将按约定退还', icon: 'none', duration: 2000 });
    }
  };

  const exportContent = `
═══════════════════════════════════
           搬离清算清单
═══════════════════════════════════

清算日期：${formatDate(checkoutDate)}
清算状态：${STATUS_LABEL[status]}

═══════════════════════════════════
           押金信息
═══════════════════════════════════
押金总额：${formatMoney(totalDeposit)}

═══════════════════════════════════
           扣款明细
═══════════════════════════════════
${deductions.map((d, idx) => `
${idx + 1}. [${DEDUCTION_TYPE_LABEL[d.type]}] ${d.title}
   金额：${formatMoney(d.amount)}
   说明：${d.description}
   ${d.disputed ? `⚠️ 有争议：${d.disputeReason}` : ''}
`).join('')}
═══════════════════════════════════
扣款合计：${formatMoney(totalDeduction)}
预计退还：${formatMoney(calculatedRefund)}
═══════════════════════════════════

人均退还金额：
${roommates.map((rm) => `  ${rm.name}：${formatMoney(calculatedRefund / roommates.length)} (${(rm.shareRatio * 100).toFixed(0)}%)`).join('\n')}

═══════════════════════════════════
           确认状态
═══════════════════════════════════
${confirmations.length > 0
    ? confirmations.map((c) => `  ${c.roommateName}：${c.confirmed ? `✓ 已确认 (${formatDate(c.confirmedAt!)})` : '待确认'}`).join('\n')
    : roommates.map((rm) => `  ${rm.name}：待确认`).join('\n')}

${note ? `备注：${note}\n` : ''}
═══════════════════════════════════
生成时间：${new Date().toLocaleString()}
═══════════════════════════════════
  `.trim();

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
          <Text className={styles.refundValue}>{formatMoney(calculatedRefund)}</Text>
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
          <Text className={styles.addAction} onClick={openAddDeduction}>+ 添加扣款</Text>
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
                <View className={styles.deductionActions}>
                  <Text
                    className={styles.deductionAction}
                    onClick={() => openEditDeduction(d)}
                  >
                    编辑
                  </Text>
                  <Text
                    className={classnames(styles.deductionAction, styles.deductionActionWarn)}
                    onClick={() => openDisputeModal(d.id)}
                  >
                    {d.disputed ? '取消争议' : '标记争议'}
                  </Text>
                  <Text
                    className={classnames(styles.deductionAction, styles.deductionActionDanger)}
                    onClick={() => handleRemoveDeduction(d.id)}
                  >
                    删除
                  </Text>
                </View>
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
              {formatMoney(calculatedRefund / roommates.length)}
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
          {status === 'pending' && (
            <Text className={styles.confirmProgress}>
              {confirmedCount}/{confirmations.length} 人已确认
            </Text>
          )}
        </View>

        <View className={styles.confirmCard}>
          {roommates.map((rm) => {
            const confirmation = getConfirmation(rm.id);
            const isConfirmed = confirmation?.confirmed || false;
            return (
              <View key={rm.id} className={styles.confirmItem}>
                <View className={styles.confirmPerson}>
                  <View className={styles.confirmAvatar}>
                    <Text className={styles.confirmAvatarText}>{rm.name.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text className={styles.confirmName}>{rm.name}</Text>
                    {isConfirmed && confirmation?.confirmedAt && (
                      <Text className={styles.confirmTime}>
                        {formatDate(confirmation.confirmedAt)} 确认
                      </Text>
                    )}
                  </View>
                </View>
                <View className={styles.confirmRight}>
                  {status === 'draft' && (
                    <Text className={styles.confirmStatus}>未发起</Text>
                  )}
                  {status === 'pending' && !isConfirmed && (
                    <Text
                      className={classnames(styles.btn, styles.btnPrimary, styles.btnSmall)}
                      onClick={() => handleConfirmRoommate(rm.id, rm.name)}
                    >
                      确认
                    </Text>
                  )}
                  {status === 'pending' && isConfirmed && (
                    <Text className={styles.confirmedBadge}>✓ 已确认</Text>
                  )}
                  {status === 'completed' && (
                    <Text className={styles.confirmedBadge}>✓ 已确认</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View className={styles.actionBar}>
        <Text className={classnames(styles.btn, styles.btnOutline)} onClick={openExportModal}>
          导出清单
        </Text>
        {status === 'draft' && (
          <Text className={classnames(styles.btn, styles.btnPrimary)} onClick={openConfirmModal}>
            发起确认
          </Text>
        )}
        {status === 'pending' && allConfirmed && (
          <Text className={classnames(styles.btn, styles.btnSuccess)} onClick={handleCompleteCheckout}>
            确认完成
          </Text>
        )}
        {status === 'pending' && !allConfirmed && (
          <Text className={classnames(styles.btn, styles.btnPrimary)}>
            等待确认中... ({confirmedCount}/{confirmations.length})
          </Text>
        )}
        {status === 'completed' && (
          <Text className={classnames(styles.btn, styles.btnSuccess)}>
            ✓ 清算已完成
          </Text>
        )}
      </View>

      <Modal
        visible={addDeductionVisible}
        title={editingDeductionId ? '编辑扣款' : '添加扣款'}
        onClose={() => setAddDeductionVisible(false)}
        onConfirm={saveDeduction}
        confirmText="保存"
      >
        <FormField label="扣款类型" required>
          <FormPicker
            value={deductionForm.type}
            onChange={(v) => setDeductionForm({ ...deductionForm, type: v as DeductionType })}
            options={deductionTypeOptions}
          />
        </FormField>

        <FormField label="扣款名称" required error={deductionErrors.title}>
          <FormInput
            value={deductionForm.title}
            onChange={(v) => setDeductionForm({ ...deductionForm, title: v })}
            placeholder="如：客厅墙面修补"
          />
        </FormField>

        <FormField label="扣款金额(元)" required error={deductionErrors.amount}>
          <FormInput
            value={String(deductionForm.amount || '')}
            onChange={(v) => setDeductionForm({ ...deductionForm, amount: Number(v) })}
            placeholder="请输入金额"
            type="digit"
          />
        </FormField>

        <FormField label="扣款说明" required error={deductionErrors.description}>
          <FormTextarea
            value={deductionForm.description}
            onChange={(v) => setDeductionForm({ ...deductionForm, description: v })}
            placeholder="请详细说明扣款原因"
            maxLength={200}
          />
        </FormField>
      </Modal>

      <Modal
        visible={disputeModalVisible}
        title={deductions.find((d) => d.id === selectedDeductionId)?.disputed ? '取消争议' : '标记争议'}
        onClose={() => setDisputeModalVisible(false)}
        onConfirm={handleToggleDispute}
        confirmText={deductions.find((d) => d.id === selectedDeductionId)?.disputed ? '取消争议' : '标记争议'}
        confirmType={deductions.find((d) => d.id === selectedDeductionId)?.disputed ? 'primary' : 'danger'}
      >
        {!deductions.find((d) => d.id === selectedDeductionId)?.disputed && (
          <FormField label="争议理由" required>
            <FormTextarea
              value={disputeReason}
              onChange={setDisputeReason}
              placeholder="请描述争议原因和您的诉求"
              maxLength={200}
            />
          </FormField>
        )}
        {deductions.find((d) => d.id === selectedDeductionId)?.disputed && (
          <Text style={{ fontSize: 28, color: '#4E5969', textAlign: 'center', padding: '20px 0' }}>
            确定要取消这条扣款的争议标记吗？
          </Text>
        )}
      </Modal>

      <Modal
        visible={confirmModalVisible}
        title="发起清算确认"
        onClose={() => setConfirmModalVisible(false)}
        onConfirm={handleInitiateConfirm}
        confirmText="发起确认"
      >
        <Text style={{ fontSize: 28, color: '#4E5969', lineHeight: 1.6 }}>
          确认发起清算确认流程后，每位室友都需要点击自己的确认按钮完成确认。
          {'\n\n'}
          押金总额：{formatMoney(totalDeposit)}
          {'\n'}
          扣款合计：{formatMoney(totalDeduction)}
          {'\n'}
          预计退还：{formatMoney(calculatedRefund)}
          {'\n\n'}
          请确保所有扣款项目已核对无误。
        </Text>
      </Modal>

      <Modal
        visible={exportModalVisible}
        title="清算清单预览"
        onClose={() => setExportModalVisible(false)}
        showFooter={false}
      >
        <View className={styles.exportBox}>
          <Text className={styles.exportText}>
            {exportContent}
          </Text>
        </View>
        <Text
          className={styles.copyBtn}
          onClick={() => {
            Taro.showToast({ title: '清单已复制到剪贴板', icon: 'success' });
            setExportModalVisible(false);
          }}
        >
          📋 复制清单文本
        </Text>
      </Modal>
    </ScrollView>
  );
};

export default CheckoutPage;

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store';
import { formatMoney, formatDate, formatDateTime } from '@/utils';
import {
  DEDUCTION_TYPE_LABEL,
  DEDUCTION_TYPE_COLOR,
  type DeductionType,
  type RoommateConfirmation
} from '@/types';
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
    updateRoommateConfirmation,
    completeCheckout,
    updateCheckoutRecord
  } = useAppStore();
  const { deductions, totalDeposit, status, checkoutDate, note, confirmations } = checkoutRecord;
  const { roommates } = rentalProfile;

  const [currentUserId, setCurrentUserId] = useState<string>(roommates[0]?.id || '');
  const [currentUserName, setCurrentUserName] = useState<string>(roommates[0]?.name || '');

  const [addDeductionVisible, setAddDeductionVisible] = useState(false);
  const [disputeModalVisible, setDisputeModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [singleConfirmModalVisible, setSingleConfirmModalVisible] = useState(false);
  const [noteEditVisible, setNoteEditVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [deductionForm, setDeductionForm] = useState(emptyDeduction);
  const [editingDeductionId, setEditingDeductionId] = useState<string | null>(null);
  const [deductionErrors, setDeductionErrors] = useState<Record<string, string>>({});
  const [disputeReason, setDisputeReason] = useState('');
  const [selectedDeductionId, setSelectedDeductionId] = useState<string | null>(null);
  const [confirmingRoommateId, setConfirmingRoommateId] = useState<string>('');
  const [confirmingRoommateName, setConfirmingRoommateName] = useState<string>('');
  const [confirmContent, setConfirmContent] = useState('');
  const [noteText, setNoteText] = useState(note || '');

  const userOptions = roommates.map((rm) => ({
    label: rm.name,
    value: rm.id
  }));

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

  const myPendingCount = useMemo(() => {
    const myConf = getConfirmation(currentUserId);
    if (status !== 'pending' || myConf?.confirmed) return 0;
    return deductions.length;
  }, [status, currentUserId, confirmations, deductions.length]);

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

  const openSingleConfirmModal = (roommateId: string, roommateName: string) => {
    setConfirmingRoommateId(roommateId);
    setConfirmingRoommateName(roommateName);
    setConfirmContent('');
    setSingleConfirmModalVisible(true);
  };

  const openNoteEditModal = () => {
    setNoteText(note || '');
    setNoteEditVisible(true);
  };

  const openDetailModal = (deductionId: string) => {
    setSelectedDeductionId(deductionId);
    setDetailModalVisible(true);
  };

  const saveDeduction = () => {
    const errors: Record<string, string> = {};
    if (!deductionForm.title.trim()) errors.title = '请输入扣款名称';
    if (!deductionForm.amount || deductionForm.amount <= 0) errors.amount = '请输入有效金额';
    if (!deductionForm.description.trim()) errors.description = '请输入扣款说明';

    if (Object.keys(errors).length > 0) {
      setDeductionErrors(errors);
      return false;
    }

    if (editingDeductionId) {
      updateDeduction(editingDeductionId, deductionForm);
    } else {
      addDeduction(deductionForm);
    }
  };

  const handleToggleDispute = () => {
    if (selectedDeductionId) {
      const deduction = deductions.find((d) => d.id === selectedDeductionId);
      if (deduction && !deduction.disputed) {
        if (!disputeReason.trim()) {
          Taro.showToast({ title: '请输入争议理由', icon: 'none' });
          return false;
        }
      }
      if (deduction) {
        updateDeduction(selectedDeductionId, {
          disputed: !deduction.disputed,
          disputeReason: !deduction.disputed ? disputeReason : undefined
        });
      }
    }
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
  };

  const handleSingleConfirm = () => {
    if (!confirmContent.trim()) {
      Taro.showToast({ title: '请填写确认内容', icon: 'none' });
      return false;
    }
    confirmRoommate(confirmingRoommateId);
    const updateData: Partial<RoommateConfirmation> = {
      confirmContent: confirmContent.trim(),
      confirmedAt: new Date().toISOString()
    };
    updateRoommateConfirmation(confirmingRoommateId, updateData);

    const newConfirmedCount = confirmations.filter((c) => c.confirmed).length + 1;
    if (newConfirmedCount === confirmations.length) {
      setTimeout(async () => {
        const res2 = await Taro.showModal({
          title: '🎉 全部确认！',
          content: '所有室友已确认！是否完成清算并生成最终清单？'
        });
        if (res2.confirm) {
          completeCheckout();
          Taro.showToast({ title: '清算已完成！', icon: 'success', duration: 2000 });
          setTimeout(() => setExportModalVisible(true), 800);
        }
      }, 500);
    }
  };

  const handleCompleteCheckout = async () => {
    const res = await Taro.showModal({
      title: '确认完成',
      content: '确定完成清算吗？完成后将无法修改任何内容。'
    });
    if (res.confirm) {
      completeCheckout();
      Taro.showToast({ title: '清算已完成！', icon: 'success', duration: 2000 });
      setTimeout(() => setExportModalVisible(true), 800);
    }
  };

  const handleSaveNote = () => {
    updateCheckoutRecord({ note: noteText.trim() || undefined });
  };

  const handleCopyExport = async () => {
    try {
      await Taro.setClipboardData({ data: exportContent });
      Taro.showToast({ title: '已复制到剪贴板', icon: 'success' });
    } catch (_e) {
      Taro.showToast({ title: '复制失败', icon: 'none' });
    }
    setExportModalVisible(false);
  };

  const exportContent = `
═══════════════════════════════════
       合租搬离清算清单
═══════════════════════════════════

清算日期：${formatDate(checkoutDate)}
清算状态：${STATUS_LABEL[status]}
生成时间：${new Date().toLocaleString()}

═══════════════════════════════════
       押金与退款信息
═══════════════════════════════════
押金总额：${formatMoney(totalDeposit)}
扣款合计：${formatMoney(totalDeduction)} (${deductions.length}项)
预计退还：${formatMoney(calculatedRefund)}
争议项目：${disputedCount}项

═══════════════════════════════════
       扣款明细清单
═══════════════════════════════════
${deductions.length === 0 ? '  暂无扣款项目\n' :
  deductions.map((d, idx) => `
  ${idx + 1}. [${DEDUCTION_TYPE_LABEL[d.type]}] ${d.title}
      金额：${formatMoney(d.amount)}
      说明：${d.description}
      ${d.disputed ? `⚠️ 有争议：${d.disputeReason}` : '✓ 无争议'}
  `).join('')}
═══════════════════════════════════

═══════════════════════════════════
       室友确认记录
═══════════════════════════════════
${confirmations.length > 0
  ? confirmations.map((c, idx) => `
  ${idx + 1}. ${c.roommateName}
      状态：${c.confirmed ? `✓ 已确认` : '待确认'}
      ${c.confirmed ? `时间：${formatDateTime(c.confirmedAt!)}` : ''}
      ${c.confirmed && c.confirmContent ? `留言：${c.confirmContent}` : ''}
  `).join('')
  : roommates.map((rm, idx) => `
  ${idx + 1}. ${rm.name} - 待确认
  `).join('')}
═══════════════════════════════════

═══════════════════════════════════
       人均退款分配
═══════════════════════════════════
${roommates.map((rm) => `
  ${rm.name}：
    分摊比例：${(rm.shareRatio * 100).toFixed(1)}%
    预计退还：${formatMoney(calculatedRefund / roommates.length)}
`).join('')}
═══════════════════════════════════
${note ? `
备注说明：${note}

` : ''}
 本清单由合租风险记录小程序生成
═══════════════════════════════════
  `.trim();

  const selectedDeduction = selectedDeductionId
    ? deductions.find((d) => d.id === selectedDeductionId)
    : null;
  const myConfirmation = getConfirmation(currentUserId);

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.pageHeader}>
        <Text className={styles.pageTitle}>📦 搬离清算</Text>
        <Text className={styles.pageDesc}>核对押金扣款，顺利完成退租</Text>
      </View>

      <View className={styles.userSwitchCard}>
        <Text className={styles.userSwitchLabel}>当前视角：</Text>
        <View className={styles.userSwitchSelect}>
          <FormPicker
            value={currentUserId}
            onChange={(v) => {
              setCurrentUserId(v);
              const rm = roommates.find((r) => r.id === v);
              if (rm) setCurrentUserName(rm.name);
            }}
            options={userOptions}
          />
        </View>
        {myPendingCount > 0 && (
          <View className={styles.pendingBadge}>
            <Text className={styles.pendingBadgeText}>{myPendingCount}项待确认</Text>
          </View>
        )}
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
        {status === 'pending' && !myConfirmation?.confirmed && (
          <View className={styles.myTodoCard}>
            <View className={styles.myTodoHeader}>
              <Text className={styles.myTodoTitle}>🔔 {currentUserName}的待确认清单</Text>
              <Text className={styles.myTodoCount}>{deductions.length}项扣款待您确认</Text>
            </View>
            <View className={styles.myTodoList}>
              {deductions.length === 0 ? (
                <Text className={styles.myTodoEmpty}>暂无扣款项目</Text>
              ) : (
                deductions.map((d, idx) => (
                  <View
                    key={d.id}
                    className={styles.myTodoItem}
                    onClick={() => openDetailModal(d.id)}
                  >
                    <View
                      className={styles.myTodoDot}
                      style={{ backgroundColor: DEDUCTION_TYPE_COLOR[d.type] }}
                    />
                    <View className={styles.myTodoContent}>
                      <Text className={styles.myTodoItemTitle}>
                        {idx + 1}. [{DEDUCTION_TYPE_LABEL[d.type]}] {d.title}
                      </Text>
                      <Text className={styles.myTodoItemDesc}>
                        {d.description}
                      </Text>
                    </View>
                    <Text className={styles.myTodoItemAmount}>-{formatMoney(d.amount)}</Text>
                  </View>
                ))
              )}
            </View>
            <Text
              className={classnames(styles.btn, styles.btnPrimary, styles.confirmAllBtn)}
              onClick={() => openSingleConfirmModal(currentUserId, currentUserName)}
            >
              ✓ 我已核对，确认以上清算
            </Text>
          </View>
        )}

        {status === 'pending' && myConfirmation?.confirmed && (
          <View className={styles.myDoneCard}>
            <Text className={styles.myDoneTitle}>✅ {currentUserName}已确认</Text>
            <Text className={styles.myDoneTime}>确认时间：{formatDateTime(myConfirmation.confirmedAt!)}</Text>
            {myConfirmation.confirmContent && (
              <View className={styles.myDoneContentBox}>
                <Text className={styles.myDoneContentLabel}>确认留言：</Text>
                <Text className={styles.myDoneContent}>{myConfirmation.confirmContent}</Text>
              </View>
            )}
          </View>
        )}

        <View className={styles.sectionHeader}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📝</Text>
            <Text className={styles.sectionTitleText}>扣款明细</Text>
          </View>
          {status === 'draft' && (
            <Text className={styles.addAction} onClick={openAddDeduction}>+ 添加扣款</Text>
          )}
        </View>

        {deductions.length === 0 ? (
          <EmptyState icon="💸" title="暂无扣款记录" description="退租清算时添加扣款项目" />
        ) : (
          <View className={styles.deductionCard}>
            {deductions.map((d) => (
              <View key={d.id} className={styles.deductionItem}>
                <View className={styles.deductionHeader} onClick={() => openDetailModal(d.id)}>
                  <View
                    className={styles.deductionTypeTag}
                    style={{ backgroundColor: DEDUCTION_TYPE_COLOR[d.type] }}
                  >
                    <Text className={styles.deductionTypeTagText}>
                      {DEDUCTION_TYPE_LABEL[d.type]}
                    </Text>
                  </View>
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
                {status === 'draft' && (
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
              {formatMoney(calculatedRefund / Math.max(1, roommates.length))}
            </Text>
          </View>
          <View className={styles.infoRow} onClick={status === 'draft' ? openNoteEditModal : undefined}>
            <Text className={styles.infoLabel}>备注说明</Text>
            <Text className={styles.infoValue} style={{ flex: 1, textAlign: 'right' }}>
              {note || (status === 'draft' ? '点击添加备注' : '无')}
            </Text>
          </View>
        </View>

        <View className={styles.sectionHeader}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>✅</Text>
            <Text className={styles.sectionTitleText}>室友确认进度</Text>
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
            const isCurrentUser = rm.id === currentUserId;
            return (
              <View key={rm.id} className={classnames(styles.confirmItem, isCurrentUser && styles.confirmItemActive)}>
                <View className={styles.confirmPerson}>
                  <View className={classnames(styles.confirmAvatar, isCurrentUser && styles.confirmAvatarActive)}>
                    <Text className={styles.confirmAvatarText}>{rm.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View className={styles.confirmNameRow}>
                      <Text className={styles.confirmName}>{rm.name}</Text>
                      {isCurrentUser && <Text className={styles.currentUserTag}>当前视角</Text>}
                    </View>
                    {isConfirmed && confirmation?.confirmedAt && (
                      <Text className={styles.confirmTime}>
                        {formatDateTime(confirmation.confirmedAt)} 确认
                      </Text>
                    )}
                    {isConfirmed && confirmation?.confirmContent && (
                      <View className={styles.confirmContentBox}>
                        <Text className={styles.confirmContentText}>"{confirmation.confirmContent}"</Text>
                      </View>
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
                      onClick={() => openSingleConfirmModal(rm.id, rm.name)}
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
          📄 导出清单
        </Text>
        {status === 'draft' && (
          <Text className={classnames(styles.btn, styles.btnPrimary)} onClick={openConfirmModal}>
            发起确认
          </Text>
        )}
        {status === 'pending' && allConfirmed && (
          <Text className={classnames(styles.btn, styles.btnSuccess)} onClick={handleCompleteCheckout}>
            ✓ 确认完成
          </Text>
        )}
        {status === 'pending' && !allConfirmed && (
          <Text className={classnames(styles.btn, styles.btnPrimary)}>
            等待确认... ({confirmedCount}/{confirmations.length})
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
          发起后，每位室友需依次确认扣款项目。
          {'\n\n'}
          押金总额：{formatMoney(totalDeposit)}
          {'\n'}
          扣款合计：{formatMoney(totalDeduction)}
          {'\n'}
          预计退还：{formatMoney(calculatedRefund)}
          {'\n\n'}
          请确保扣款已核对无误。
        </Text>
      </Modal>

      <Modal
        visible={singleConfirmModalVisible}
        title={`${confirmingRoommateName}确认清算`}
        onClose={() => setSingleConfirmModalVisible(false)}
        onConfirm={handleSingleConfirm}
        confirmText="确认清算"
        confirmType="primary"
      >
        <Text style={{ fontSize: 28, color: '#1D2129', fontWeight: 500, marginBottom: 12, display: 'block' }}>
          📝 待确认扣款清单：
        </Text>
        <View className={styles.confirmListBox}>
          {deductions.length === 0 ? (
            <Text style={{ fontSize: 24, color: '#86909C' }}>暂无扣款项目</Text>
          ) : (
            deductions.map((d, idx) => (
              <View key={d.id} className={styles.confirmListItem}>
                <Text className={styles.confirmListIndex}>{idx + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text className={styles.confirmListTitle}>[{DEDUCTION_TYPE_LABEL[d.type]}] {d.title}</Text>
                  <Text className={styles.confirmListDesc}>{d.description}</Text>
                  {d.disputed && d.disputeReason && (
                    <Text className={styles.confirmListDispute}>⚠️ {d.disputeReason}</Text>
                  )}
                </View>
                <Text className={styles.confirmListAmount}>-{formatMoney(d.amount)}</Text>
              </View>
            ))
          )}
        </View>
        <View className={styles.confirmSummary}>
          <Text className={styles.confirmSummaryLabel}>扣款合计：</Text>
          <Text className={styles.confirmSummaryAmount}>{formatMoney(totalDeduction)}</Text>
        </View>
        <FormField label="确认留言" required>
          <FormTextarea
            value={confirmContent}
            onChange={setConfirmContent}
            placeholder="如：核对无误，同意以上扣款金额和退款方式"
            maxLength={200}
          />
        </FormField>
      </Modal>

      <Modal
        visible={noteEditVisible}
        title="编辑备注"
        onClose={() => setNoteEditVisible(false)}
        onConfirm={handleSaveNote}
        confirmText="保存"
      >
        <FormTextarea
          value={noteText}
          onChange={setNoteText}
          placeholder="选填，补充清算说明等"
          maxLength={300}
        />
      </Modal>

      <Modal
        visible={detailModalVisible}
        title="扣款详情"
        onClose={() => setDetailModalVisible(false)}
        showFooter={false}
      >
        {selectedDeduction && (
          <View className={styles.detailCard}>
            <View
              className={styles.detailTypeBadge}
              style={{ backgroundColor: DEDUCTION_TYPE_COLOR[selectedDeduction.type] }}
            >
              <Text className={styles.detailTypeText}>
                {DEDUCTION_TYPE_LABEL[selectedDeduction.type]}
              </Text>
            </View>
            <Text className={styles.detailTitle}>{selectedDeduction.title}</Text>
            <Text className={styles.detailAmount}>-{formatMoney(selectedDeduction.amount)}</Text>
            <View className={styles.detailDescBox}>
              <Text className={styles.detailDescLabel}>扣款说明</Text>
              <Text className={styles.detailDesc}>{selectedDeduction.description}</Text>
            </View>
            {selectedDeduction.disputed && (
              <View className={styles.detailDisputeBox}>
                <Text className={styles.detailDisputeLabel}>⚠️ 存在争议</Text>
                <Text className={styles.detailDispute}>{selectedDeduction.disputeReason || '无具体争议说明'}</Text>
              </View>
            )}
            <View className={styles.detailConfirmBox}>
              <Text className={styles.detailConfirmLabel}>室友确认状态</Text>
              {confirmations.map((c) => (
                <View key={c.roommateId} className={styles.detailConfirmRow}>
                  <Text className={styles.detailConfirmName}>{c.roommateName}</Text>
                  <Text
                    className={classnames(
                      styles.detailConfirmStatus,
                      c.confirmed && styles.detailConfirmed
                    )}
                  >
                    {c.confirmed ? `✓ ${formatDateTime(c.confirmedAt!)}` : '待确认'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Modal>

      <Modal
        visible={exportModalVisible}
        title="清算清单预览"
        onClose={() => setExportModalVisible(false)}
        showFooter={false}
      >
        <ScrollView scrollY className={styles.exportBox}>
          <Text className={styles.exportText}>
            {exportContent}
          </Text>
        </ScrollView>
        <Text
          className={classnames(styles.btn, styles.btnSuccess, styles.copyBtn)}
          onClick={handleCopyExport}
        >
          📋 复制清单文本
        </Text>
      </Modal>
    </ScrollView>
  );
};

export default CheckoutPage;

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { useAppStore } from '@/store';
import { formatDateTime } from '@/utils';
import {
  ISSUE_CATEGORY_LABEL,
  ISSUE_CATEGORY_COLOR,
  ISSUE_STATUS_LABEL,
  type IssueCategory,
  type IssueStatus,
  type Issue
} from '@/types';
import EmptyState from '@/components/EmptyState';
import Modal from '@/components/Modal';
import { FormField, FormInput, FormPicker, FormTextarea, FormCheckboxGroup } from '@/components/FormField';
import styles from './index.module.scss';
import classnames from 'classnames';

const emptyIssue: Omit<Issue, 'id' | 'reportedAt' | 'attachments'> = {
  category: 'hygiene',
  title: '',
  description: '',
  status: 'pending',
  reportedBy: '',
  involvedParties: []
};

const categoryOptions = Object.entries(ISSUE_CATEGORY_LABEL).map(([value, label]) => ({
  label,
  value
}));

const statusOptions: { key: IssueStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部状态' },
  { key: 'pending', label: '待处理' },
  { key: 'resolved', label: '已解决' },
  { key: 'escalated', label: '需介入' }
];

const categoryFilters: { key: IssueCategory | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'hygiene', label: '卫生' },
  { key: 'noise', label: '噪音' },
  { key: 'visitor', label: '访客' },
  { key: 'pet', label: '宠物' },
  { key: 'bill', label: '费用' },
  { key: 'rent', label: '房租' },
  { key: 'other', label: '其他' }
];

const IssuesPage: React.FC = () => {
  const { issues, rentalProfile, addIssue, updateIssue, resolveIssue } = useAppStore();
  const { roommates } = rentalProfile;

  const [filterCategory, setFilterCategory] = useState<IssueCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<IssueStatus | 'all'>('all');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [resolveModalVisible, setResolveModalVisible] = useState(false);
  const [issueForm, setIssueForm] = useState<Omit<Issue, 'id' | 'reportedAt' | 'attachments'>>(emptyIssue);
  const [issueErrors, setIssueErrors] = useState<Record<string, string>>({});
  const [resolutionText, setResolutionText] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [mockAttachments, setMockAttachments] = useState<string[]>([]);

  const stats = useMemo(() => ({
    pending: issues.filter((i) => i.status === 'pending').length,
    resolved: issues.filter((i) => i.status === 'resolved').length,
    escalated: issues.filter((i) => i.status === 'escalated').length
  }), [issues]);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const categoryMatch = filterCategory === 'all' || issue.category === filterCategory;
      const statusMatch = filterStatus === 'all' || issue.status === filterStatus;
      return categoryMatch && statusMatch;
    });
  }, [issues, filterCategory, filterStatus]);

  const roommateOptions = roommates.map((rm) => ({
    label: rm.name,
    value: rm.name
  }));

  const statusClass = (status: IssueStatus) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'resolved':
        return styles.statusResolved;
      case 'escalated':
        return styles.statusEscalated;
    }
  };

  const openAddIssue = () => {
    setIssueForm({ ...emptyIssue, reportedBy: roommates[0]?.name || '' });
    setIssueErrors({});
    setMockAttachments([]);
    setAddModalVisible(true);
  };

  const openResolveIssue = (issueId: string) => {
    setSelectedIssueId(issueId);
    setResolutionText('');
    setResolveModalVisible(true);
  };

  const saveIssue = () => {
    const errors: Record<string, string> = {};
    if (!issueForm.title.trim()) errors.title = '请输入问题标题';
    if (!issueForm.description.trim()) errors.description = '请输入问题描述';
    if (!issueForm.reportedBy.trim()) errors.reportedBy = '请选择记录人';
    if (issueForm.involvedParties.length === 0) errors.involvedParties = '请选择涉及人员';

    if (Object.keys(errors).length > 0) {
      setIssueErrors(errors);
      return;
    }

    addIssue({
      ...issueForm,
      attachments: mockAttachments
    });
    setAddModalVisible(false);
  };

  const confirmResolve = () => {
    if (!resolutionText.trim()) {
      alert('请输入解决方案');
      return;
    }
    if (selectedIssueId) {
      resolveIssue(selectedIssueId, resolutionText);
    }
    setResolveModalVisible(false);
  };

  const simulateUpload = () => {
    const mockImages = [
      '📸 聊天截图',
      '📷 现场照片',
      '🎥 视频片段',
      '📄 文档证据'
    ];
    const newAttachment = mockImages[Math.floor(Math.random() * mockImages.length)];
    setMockAttachments([...mockAttachments, newAttachment]);
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.pageHeader}>
        <Text className={styles.pageTitle}>⚠️ 问题记录</Text>
        <Text className={styles.pageDesc}>记录合租中的争议事件，留痕有据</Text>
        <View className={styles.statsRow}>
          <View className={styles.statChip}>
            <Text className={styles.statChipValue}>{stats.pending}</Text>
            <Text className={styles.statChipLabel}>待处理</Text>
          </View>
          <View className={styles.statChip}>
            <Text className={styles.statChipValue}>{stats.resolved}</Text>
            <Text className={styles.statChipLabel}>已解决</Text>
          </View>
          <View className={styles.statChip}>
            <Text className={styles.statChipValue}>{stats.escalated}</Text>
            <Text className={styles.statChipLabel}>需介入</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollX className={styles.filterRow}>
        {categoryFilters.map((f) => (
          <Text
            key={f.key}
            className={classnames(
              styles.filterChip,
              filterCategory === f.key && styles.filterChipActive
            )}
            onClick={() => setFilterCategory(f.key)}
          >
            {f.label}
          </Text>
        ))}
      </ScrollView>

      <ScrollView scrollX className={styles.filterRow} style={{ paddingTop: 8 }}>
        {statusOptions.map((f) => (
          <Text
            key={f.key}
            className={classnames(
              styles.filterChip,
              filterStatus === f.key && styles.filterChipActive
            )}
            onClick={() => setFilterStatus(f.key)}
          >
            {f.label}
          </Text>
        ))}
      </ScrollView>

      <View className={styles.contentArea}>
        {filteredIssues.length === 0 ? (
          <EmptyState icon="📋" title="暂无问题记录" description="点击右下角记录问题事件" />
        ) : (
          filteredIssues.map((issue) => (
            <View key={issue.id} className={styles.issueCard}>
              <View className={styles.issueHeader}>
                <View
                  className={styles.issueCategory}
                  style={{ backgroundColor: ISSUE_CATEGORY_COLOR[issue.category] }}
                >
                  <Text>{ISSUE_CATEGORY_LABEL[issue.category]}</Text>
                </View>
                <Text className={classnames(styles.issueStatus, statusClass(issue.status))}>
                  {ISSUE_STATUS_LABEL[issue.status]}
                </Text>
              </View>

              <Text className={styles.issueTitle}>{issue.title}</Text>
              <Text className={styles.issueDesc}>{issue.description}</Text>

              {issue.resolution && issue.status === 'resolved' && (
                <View className={styles.resolution}>
                  <Text className={styles.resolutionLabel}>✅ 解决方案</Text>
                  <Text className={styles.resolutionContent}>{issue.resolution}</Text>
                </View>
              )}

              <View className={styles.issueMeta}>
                <View className={styles.metaItem}>
                  <Text className={styles.metaLabel}>记录人：</Text>
                  <Text className={styles.metaValue}>{issue.reportedBy}</Text>
                </View>
                <View className={styles.metaItem}>
                  <Text className={styles.metaLabel}>时间：</Text>
                  <Text className={styles.metaValue}>{formatDateTime(issue.reportedAt)}</Text>
                </View>
                <View className={styles.involvedRow}>
                  <Text className={styles.metaLabel}>涉及人员：</Text>
                  {issue.involvedParties.map((p, idx) => (
                    <Text key={idx} className={styles.personTag}>{p}</Text>
                  ))}
                </View>
                {issue.attachments.length > 0 && (
                  <View className={styles.metaItem}>
                    <Text className={styles.metaLabel}>📎 证据：</Text>
                    <Text className={styles.metaValue}>
                      {issue.attachments.join('、')}
                    </Text>
                  </View>
                )}
              </View>

              {issue.status !== 'resolved' && (
                <View className={styles.issueFooter}>
                  <Text
                    className={classnames(styles.btn, styles.btnOutline)}
                    onClick={() => updateIssue(issue.id, { status: 'escalated' })}
                  >
                    申请介入
                  </Text>
                  <Text
                    className={classnames(styles.btn, styles.btnPrimary)}
                    onClick={() => openResolveIssue(issue.id)}
                  >
                    标记解决
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>

      <View className={styles.fab} onClick={openAddIssue}>
        <Text className={styles.fabIcon}>+</Text>
      </View>

      <Modal
        visible={addModalVisible}
        title="记录问题事件"
        onClose={() => setAddModalVisible(false)}
        onConfirm={saveIssue}
        confirmText="保存记录"
      >
        <FormField label="问题分类" required>
          <FormPicker
            value={issueForm.category}
            onChange={(v) => setIssueForm({ ...issueForm, category: v as IssueCategory })}
            options={categoryOptions}
          />
        </FormField>

        <FormField label="问题标题" required error={issueErrors.title}>
          <FormInput
            value={issueForm.title}
            onChange={(v) => setIssueForm({ ...issueForm, title: v })}
            placeholder="简短描述问题"
          />
        </FormField>

        <FormField label="详细描述" required error={issueErrors.description}>
          <FormTextarea
            value={issueForm.description}
            onChange={(v) => setIssueForm({ ...issueForm, description: v })}
            placeholder="详细描述事件经过、时间、地点等信息"
            maxLength={500}
          />
        </FormField>

        <FormField label="记录人" required error={issueErrors.reportedBy}>
          <FormPicker
            value={issueForm.reportedBy}
            onChange={(v) => setIssueForm({ ...issueForm, reportedBy: v })}
            options={roommateOptions}
          />
        </FormField>

        <FormField label="涉及人员" required error={issueErrors.involvedParties}>
          <FormCheckboxGroup
            value={issueForm.involvedParties}
            onChange={(v) => setIssueForm({ ...issueForm, involvedParties: v })}
            options={roommateOptions}
          />
        </FormField>

        <FormField label="上传证据">
          <View>
            <View
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginBottom: 8
              }}
            >
              {mockAttachments.map((att, idx) => (
                <Text
                  key={idx}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#F0F2F5',
                    borderRadius: 8,
                    fontSize: 24,
                    color: '#4E5969'
                  }}
                >
                  {att}
                </Text>
              ))}
            </View>
            <Text
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                border: '1px dashed #20C997',
                borderRadius: 8,
                color: '#20C997',
                fontSize: 24,
                backgroundColor: 'rgba(32, 201, 151, 0.05)'
              }}
              onClick={simulateUpload}
            >
              📷 上传截图/照片
            </Text>
            {mockAttachments.length > 0 && (
              <Text style={{ fontSize: 22, color: '#86909C', marginTop: 8 }}>
                已上传 {mockAttachments.length} 个证据
              </Text>
            )}
          </View>
        </FormField>
      </Modal>

      <Modal
        visible={resolveModalVisible}
        title="标记问题已解决"
        onClose={() => setResolveModalVisible(false)}
        onConfirm={confirmResolve}
        confirmText="确认解决"
      >
        <FormField label="解决方案" required>
          <FormTextarea
            value={resolutionText}
            onChange={setResolutionText}
            placeholder="请描述解决方案和处理结果"
            maxLength={200}
          />
        </FormField>
      </Modal>
    </ScrollView>
  );
};

export default IssuesPage;

import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
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
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [previewCurrent, setPreviewCurrent] = useState(0);
  const [issueForm, setIssueForm] = useState<Omit<Issue, 'id' | 'reportedAt' | 'attachments'>>(emptyIssue);
  const [issueErrors, setIssueErrors] = useState<Record<string, string>>({});
  const [resolutionText, setResolutionText] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<string[]>([]);

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
    setAttachments([]);
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
      attachments: attachments
    });
    setAddModalVisible(false);
  };

  const confirmResolve = () => {
    if (!resolutionText.trim()) {
      Taro.showToast({ title: '请输入解决方案', icon: 'none' });
      return;
    }
    if (selectedIssueId) {
      resolveIssue(selectedIssueId, resolutionText);
    }
    setResolveModalVisible(false);
  };

  const handleChooseImage = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 9 - attachments.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      });
      setAttachments([...attachments, ...res.tempFilePaths]);
    } catch (e) {
      console.log('用户取消选择图片');
    }
  };

  const handleRemoveImage = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const handlePreviewImage = (urls: string[], current: number) => {
    setPreviewUrls(urls);
    setPreviewCurrent(current);
    setPreviewVisible(true);
  };

  const handleClosePreview = () => {
    setPreviewVisible(false);
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

              {issue.attachments.length > 0 && (
                <View className={styles.attachmentSection}>
                  <View className={styles.attachmentHeader}>
                    <Text className={styles.attachmentLabel}>📎 证据附件</Text>
                    <Text className={styles.attachmentCount}>{issue.attachments.length} 张</Text>
                  </View>
                  <View className={styles.thumbnailRow}>
                    {issue.attachments.slice(0, 4).map((url, idx) => (
                      <View
                        key={idx}
                        className={styles.thumbnailItem}
                        onClick={() => handlePreviewImage(issue.attachments, idx)}
                      >
                        <Image
                          src={url}
                          className={styles.thumbnailImage}
                          mode="aspectFill"
                        />
                        {idx === 3 && issue.attachments.length > 4 && (
                          <View className={styles.thumbnailMore}>
                            <Text className={styles.thumbnailMoreText}>+{issue.attachments.length - 4}</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
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
          <View className={styles.uploadArea}>
            <View className={styles.uploadRow}>
              {attachments.map((url, idx) => (
                <View key={idx} className={styles.uploadItem}>
                  <Image
                    src={url}
                    className={styles.uploadImage}
                    mode="aspectFill"
                    onClick={() => handlePreviewImage(attachments, idx)}
                  />
                  <View
                    className={styles.uploadRemove}
                    onClick={() => handleRemoveImage(idx)}
                  >
                    <Text className={styles.uploadRemoveText}>×</Text>
                  </View>
                </View>
              ))}
              {attachments.length < 9 && (
                <View className={styles.uploadAdd} onClick={handleChooseImage}>
                  <Text className={styles.uploadAddIcon}>+</Text>
                  <Text className={styles.uploadAddText}>上传图片</Text>
                </View>
              )}
            </View>
            {attachments.length > 0 && (
              <Text className={styles.uploadHint}>
                已上传 {attachments.length}/9 张图片
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

      <Modal
        visible={previewVisible}
        title={`图片预览 ${previewCurrent + 1}/${previewUrls.length}`}
        onClose={handleClosePreview}
        showFooter={false}
      >
        <View className={styles.previewContainer}>
          <ScrollView scrollX scrollWithAnimation className={styles.previewScroll} showScrollbar={false}>
            <View className={styles.previewWrapper}>
              {previewUrls.map((url, idx) => (
                <View key={idx} className={styles.previewItem}>
                  <Image
                    src={url}
                    className={styles.previewImage}
                    mode="aspectFit"
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default IssuesPage;

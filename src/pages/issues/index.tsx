import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { useAppStore } from '@/store';
import {
  formatDateTime
} from '@/utils';
import {
  ISSUE_CATEGORY_LABEL,
  ISSUE_CATEGORY_COLOR,
  ISSUE_STATUS_LABEL,
  type IssueCategory,
  type IssueStatus
} from '@/types';
import EmptyState from '@/components/EmptyState';
import styles from './index.module.scss';
import classnames from 'classnames';

const IssuesPage: React.FC = () => {
  const { issues } = useAppStore();
  const [filterCategory, setFilterCategory] = useState<IssueCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<IssueStatus | 'all'>('all');

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

  const statusFilters: { key: IssueStatus | 'all'; label: string }[] = [
    { key: 'all', label: '全部状态' },
    { key: 'pending', label: '待处理' },
    { key: 'resolved', label: '已解决' },
    { key: 'escalated', label: '需介入' }
  ];

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
        {statusFilters.map((f) => (
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
          <EmptyState icon="📋" title="暂无问题记录" description="有争议事件随时记录下来" />
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
                    <Text className={styles.metaLabel}>📎 证据附件：</Text>
                    <Text className={styles.metaValue}>{issue.attachments.length} 张</Text>
                  </View>
                )}
              </View>

              {issue.status !== 'resolved' && (
                <View className={styles.issueFooter}>
                  <Text className={classnames(styles.btn, styles.btnOutline)}>
                    查看详情
                  </Text>
                  <Text className={classnames(styles.btn, styles.btnPrimary)}>
                    标记解决
                  </Text>
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

export default IssuesPage;

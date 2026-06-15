import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { useAppStore } from '@/store';
import { formatDate, formatMoney } from '@/utils';
import EmptyState from '@/components/EmptyState';
import styles from './index.module.scss';
import classnames from 'classnames';

const CATEGORY_LABEL: Record<string, string> = {
  rent: '租金',
  deposit: '押金',
  maintenance: '维修',
  termination: '解约',
  other: '其他'
};

const CATEGORY_CLASS: Record<string, string> = {
  rent: styles.catRent,
  deposit: styles.catDeposit,
  maintenance: styles.catMaintenance,
  termination: styles.catTermination,
  other: styles.catOther
};

const RULE_ICON: Record<string, { icon: string; color: string; bg: string } = {
  hygiene: { icon: '🧹', color: '#20C997', bg: 'rgba(32, 201, 151, 0.1)' },
  noise: { icon: '🔇', color: '#F53F3F', bg: 'rgba(245, 63, 63, 0.1)' },
  visitor: { icon: '👥', color: '#722ED1', bg: 'rgba(114, 46, 209, 0.1)' },
  pet: { icon: '🐾', color: '#FF9F43', bg: 'rgba(255, 159, 67, 0.1)' },
  smoking: { icon: '🚭', color: '#165DFF', bg: 'rgba(22, 93, 255, 0.1)' },
  other: { icon: '📋', color: '#86909C', bg: '#F2F3F5' }
};

const RulesPage: React.FC = () => {
  const { contractClauses, publicItems, houseRules } = useAppStore();

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.pageHeader}>
        <Text className={styles.pageTitle}>📜 公共规则</Text>
        <Text className={styles.pageDesc}>
          合同条款 · 公共物品 · 合租约定，一目了然
        </Text>
      </View>

      <View className={styles.contentArea}>
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>📋</Text>
              <Text className={styles.sectionTitleText}>合同关键条款</Text>
            </View>
          </View>

          {contractClauses.length === 0 ? (
            <EmptyState icon="📄" title="暂无合同条款" description="添加重要的合同条款保存在这里" />
          ) : (
            <View className={styles.contractCard}>
              {contractClauses.map((clause) => (
              <View key={clause.id} className={styles.clauseItem}>
                <View className={styles.clauseHeader}>
                  <Text className={classnames(styles.clauseCategory, CATEGORY_CLASS[clause.category])}>
                    {CATEGORY_LABEL[clause.category]}
                  </Text>
                  <Text className={styles.clauseTitle}>{clause.title}</Text>
                </View>
                <Text className={styles.clauseContent}>{clause.content}</Text>
              </View>
            ))}
            </View>
          )}
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>🛒</Text>
              <Text className={styles.sectionTitleText}>公共物品清单</Text>
            </View>
            <Text className={styles.addAction}>+ 添加</Text>
          </View>

          {publicItems.length === 0 ? (
            <EmptyState icon="📦" title="暂无公共物品" description="记录大家共同购买的物品" />
          ) : (
            <View className={styles.itemCard}>
              {publicItems.map((item) => (
                <View key={item.id} className={styles.itemRow}>
                  <View className={styles.itemInfo}>
                    <Text className={styles.itemName}>{item.name}</Text>
                    <Text className={styles.itemMeta}>
                      {item.purchaser && `购买人：${item.purchaser}`}
                      {item.purchaseDate && ` · ${formatDate(item.purchaseDate)}`}
                      {item.note && ` · ${item.note}`}
                    </Text>
                  </View>
                  <View className={styles.itemRight}>
                    <Text className={styles.itemQuantity}>×{item.quantity}</Text>
                    {item.price != null && (
                      <Text className={styles.itemPrice}>{formatMoney(item.price)}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>🏠</Text>
              <Text className={styles.sectionTitleText}>合租约定</Text>
            </View>
            <Text className={styles.addAction}>+ 添加</Text>
          </View>

          {houseRules.length === 0 ? (
            <EmptyState icon="📝" title="暂无合租约定" description="和室友一起制定的规矩吧" />
          ) : (
            <View className={styles.ruleCard}>
              {houseRules.map((rule) => {
                const iconData = RULE_ICON[rule.category] || RULE_ICON.other;
                return (
                  <View key={rule.id} className={styles.ruleItem}>
                    <View
                      className={styles.ruleIcon}
                      style={{ backgroundColor: iconData.bg, color: iconData.color }}
                    >
                      <Text>{iconData.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text className={styles.ruleContent}>{rule.content}</Text>
                      <Text className={styles.ruleDate}>
                        制定于 {formatDate(rule.createdAt)}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>

      <View className={styles.fab}>
        <Text className={styles.fabIcon}>+</Text>
      </View>
    </ScrollView>
  );
};

export default RulesPage;

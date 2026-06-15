import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store';
import { formatDate, formatMoney } from '@/utils';
import type {
  ContractClause,
  PublicItem,
  HouseRule,
  HouseRuleCategory
} from '@/types';
import EmptyState from '@/components/EmptyState';
import Modal from '@/components/Modal';
import { FormField, FormInput, FormPicker, FormTextarea } from '@/components/FormField';
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

const RULE_ICON: Record<string, { icon: string; color: string; bg: string }> = {
  hygiene: { icon: '🧹', color: '#20C997', bg: 'rgba(32, 201, 151, 0.1)' },
  noise: { icon: '🔇', color: '#F53F3F', bg: 'rgba(245, 63, 63, 0.1)' },
  visitor: { icon: '👥', color: '#722ED1', bg: 'rgba(114, 46, 209, 0.1)' },
  pet: { icon: '🐾', color: '#FF9F43', bg: 'rgba(255, 159, 67, 0.1)' },
  smoking: { icon: '🚭', color: '#165DFF', bg: 'rgba(22, 93, 255, 0.1)' },
  other: { icon: '📋', color: '#86909C', bg: '#F2F3F5' }
};

const clauseCategoryOptions = Object.entries(CATEGORY_LABEL).map(([value, label]) => ({
  label,
  value
}));

const ruleCategoryOptions = [
  { label: '卫生', value: 'hygiene' },
  { label: '噪音', value: 'noise' },
  { label: '访客', value: 'visitor' },
  { label: '宠物', value: 'pet' },
  { label: '吸烟', value: 'smoking' },
  { label: '其他', value: 'other' }
];

const emptyClause: Omit<ContractClause, 'id'> = {
  title: '',
  content: '',
  category: 'other'
};

const emptyItem: Omit<PublicItem, 'id'> = {
  name: '',
  quantity: 1,
  purchaser: '',
  purchaseDate: '',
  price: 0,
  note: ''
};

const emptyRule: Omit<HouseRule, 'id' | 'createdAt'> = {
  content: '',
  category: 'other'
};

type ModalType = 'clause' | 'item' | 'rule' | null;

const RulesPage: React.FC = () => {
  const {
    contractClauses,
    publicItems,
    houseRules,
    addContractClause,
    removeContractClause,
    addPublicItem,
    removePublicItem,
    addHouseRule,
    removeHouseRule
  } = useAppStore();

  const [modalType, setModalType] = useState<ModalType>(null);
  const [clauseForm, setClauseForm] = useState(emptyClause);
  const [itemForm, setItemForm] = useState(emptyItem);
  const [ruleForm, setRuleForm] = useState(emptyRule);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openModal = (type: ModalType) => {
    setModalType(type);
    setErrors({});
    if (type === 'clause') setClauseForm({ ...emptyClause });
    if (type === 'item') setItemForm({ ...emptyItem });
    if (type === 'rule') setRuleForm({ ...emptyRule });
  };

  const closeModal = () => {
    setModalType(null);
  };

  const saveClause = () => {
    const e: Record<string, string> = {};
    if (!clauseForm.title.trim()) e.title = '请输入条款标题';
    if (!clauseForm.content.trim()) e.content = '请输入条款内容';
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return false;
    }
    addContractClause(clauseForm);
    return true;
  };

  const saveItem = () => {
    const e: Record<string, string> = {};
    if (!itemForm.name.trim()) e.name = '请输入物品名称';
    if (!itemForm.quantity || itemForm.quantity <= 0) e.quantity = '请输入有效数量';
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return false;
    }
    addPublicItem(itemForm);
    return true;
  };

  const saveRule = () => {
    const e: Record<string, string> = {};
    if (!ruleForm.content.trim()) e.content = '请输入约定内容';
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return false;
    }
    addHouseRule(ruleForm);
    return true;
  };

  const handleSave = (): boolean => {
    if (modalType === 'clause') return saveClause();
    if (modalType === 'item') return saveItem();
    if (modalType === 'rule') return saveRule();
    return true;
  };

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
            <Text className={styles.addAction} onClick={() => openModal('clause')}>+ 添加</Text>
          </View>

          {contractClauses.length === 0 ? (
            <EmptyState icon="📄" title="暂无合同条款" description="点击右上角添加重要条款" />
          ) : (
            <View className={styles.contractCard}>
              {contractClauses.map((clause) => (
                <View key={clause.id} className={styles.clauseItem}>
                  <View className={styles.clauseHeader}>
                    <Text className={classnames(styles.clauseCategory, CATEGORY_CLASS[clause.category])}>
                      {CATEGORY_LABEL[clause.category]}
                    </Text>
                    <Text className={styles.clauseTitle}>{clause.title}</Text>
                    <Text
                      className={styles.removeBtn}
                      onClick={async () => {
                        const res = await Taro.showModal({ title: '确认删除', content: '确定删除这条条款吗？' });
                        if (res.confirm) removeContractClause(clause.id);
                      }}
                    >
                      删除
                    </Text>
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
            <Text className={styles.addAction} onClick={() => openModal('item')}>+ 添加</Text>
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
                    <Text
                      className={styles.removeBtnSmall}
                      onClick={async () => {
                        const res = await Taro.showModal({ title: '确认删除', content: '确定删除这个物品吗？' });
                        if (res.confirm) removePublicItem(item.id);
                      }}
                    >
                      删除
                    </Text>
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
            <Text className={styles.addAction} onClick={() => openModal('rule')}>+ 添加</Text>
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
                    <View className="flex1">
                      <Text className={styles.ruleContent}>{rule.content}</Text>
                      <View className="flex spaceBetween itemsCenter">
                        <Text className={styles.ruleDate}>制定于 {formatDate(rule.createdAt)}</Text>
                        <Text
                          className={styles.removeBtnSmall}
                          onClick={async () => {
                            const res = await Taro.showModal({ title: '确认删除', content: '确定删除这条约定吗？' });
                            if (res.confirm) removeHouseRule(rule.id);
                          }}
                        >
                          删除
                        </Text>
                      </View>
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

      <Modal
        visible={modalType === 'clause'}
        title="添加合同条款"
        onClose={closeModal}
        onConfirm={handleSave}
        confirmText="保存"
      >
        <FormField label="条款分类" required>
          <FormPicker
            value={clauseForm.category}
            onChange={(v) => setClauseForm({ ...clauseForm, category: v as any })}
            options={clauseCategoryOptions}
          />
        </FormField>

        <FormField label="条款标题" required error={errors.title}>
          <FormInput
            value={clauseForm.title}
            onChange={(v) => setClauseForm({ ...clauseForm, title: v })}
            placeholder="如：押金退还"
          />
        </FormField>

        <FormField label="条款内容" required error={errors.content}>
          <FormTextarea
            value={clauseForm.content}
            onChange={(v) => setClauseForm({ ...clauseForm, content: v })}
            placeholder="请详细描述条款内容"
            maxLength={500}
          />
        </FormField>
      </Modal>

      <Modal
        visible={modalType === 'item'}
        title="添加公共物品"
        onClose={closeModal}
        onConfirm={handleSave}
        confirmText="保存"
      >
        <FormField label="物品名称" required error={errors.name}>
          <FormInput
            value={itemForm.name}
            onChange={(v) => setItemForm({ ...itemForm, name: v })}
            placeholder="如：洗衣液"
          />
        </FormField>

        <View className="formRow">
          <FormField label="数量" required error={errors.quantity} className="formCol">
            <FormInput
              value={String(itemForm.quantity)}
              onChange={(v) => setItemForm({ ...itemForm, quantity: Number(v) })}
              placeholder="如：2"
              type="number"
            />
          </FormField>
          <FormField label="单价(元)" className="formCol">
            <FormInput
              value={String(itemForm.price || '')}
              onChange={(v) => setItemForm({ ...itemForm, price: Number(v) })}
              placeholder="选填"
              type="digit"
            />
          </FormField>
        </View>

        <View className="formRow">
          <FormField label="购买人" className="formCol">
            <FormInput
              value={itemForm.purchaser || ''}
              onChange={(v) => setItemForm({ ...itemForm, purchaser: v })}
              placeholder="选填"
            />
          </FormField>
          <FormField label="购买日期" className="formCol">
            <FormInput
              value={itemForm.purchaseDate || ''}
              onChange={(v) => setItemForm({ ...itemForm, purchaseDate: v })}
              placeholder="YYYY-MM-DD"
            />
          </FormField>
        </View>

        <FormField label="备注">
          <FormInput
            value={itemForm.note || ''}
            onChange={(v) => setItemForm({ ...itemForm, note: v })}
            placeholder="选填"
          />
        </FormField>
      </Modal>

      <Modal
        visible={modalType === 'rule'}
        title="添加合租约定"
        onClose={closeModal}
        onConfirm={handleSave}
        confirmText="保存"
      >
        <FormField label="约定分类" required>
          <FormPicker
            value={ruleForm.category}
            onChange={(v) => setRuleForm({ ...ruleForm, category: v as HouseRuleCategory })}
            options={ruleCategoryOptions}
          />
        </FormField>

        <FormField label="约定内容" required error={errors.content}>
          <FormTextarea
            value={ruleForm.content}
            onChange={(v) => setRuleForm({ ...ruleForm, content: v })}
            placeholder="如：晚上23:00后保持安静"
            maxLength={200}
          />
        </FormField>
      </Modal>
    </ScrollView>
  );
};

export default RulesPage;

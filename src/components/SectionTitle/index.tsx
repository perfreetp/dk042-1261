import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface SectionTitleProps {
  title: string;
  actionText?: string;
  onAction?: () => void;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, actionText, onAction }) => {
  return (
    <View className={styles.container}>
      <View className={styles.left}>
        <View className={styles.bar} />
        <Text className={styles.title}>{title}</Text>
      </View>
      {actionText && (
        <Text className={styles.action} onClick={onAction}>
          {actionText}
        </Text>
      )}
    </View>
  );
};

export default SectionTitle;

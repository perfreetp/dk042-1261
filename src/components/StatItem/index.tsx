import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface StatItemProps {
  value: string | number;
  label: string;
  valueColor?: string;
}

const StatItem: React.FC<StatItemProps> = ({ value, label, valueColor }) => {
  return (
    <View className={styles.container}>
      <Text className={styles.value} style={{ color: valueColor }}>
        {value}
      </Text>
      <Text className={styles.label}>{label}</Text>
    </View>
  );
};

export default StatItem;

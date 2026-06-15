import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface CardProps {
  title?: string;
  extra?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ title, extra, footer, className, children, onClick }) => {
  return (
    <View
      className={classnames(styles.card, className)}
      onClick={onClick}
    >
      {(title || extra) && (
        <View className={styles.cardHeader}>
          {title && <Text className={styles.cardTitle}>{title}</Text>}
          {extra && <View>{extra}</View>}
        </View>
      )}
      <View className={styles.cardBody}>{children}</View>
      {footer && <View className={styles.cardFooter}>{footer}</View>}
    </View>
  );
};

export default Card;

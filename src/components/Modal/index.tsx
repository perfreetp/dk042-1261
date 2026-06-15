import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface ModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showFooter?: boolean;
  showCancel?: boolean;
  confirmType?: 'primary' | 'danger';
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  title,
  onClose,
  onConfirm,
  confirmText = '确定',
  cancelText = '取消',
  showFooter = true,
  showCancel = true,
  confirmType = 'primary',
  children
}) => {
  if (!visible) return null;

  const handleMaskClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <View className={styles.mask} onClick={handleMaskClick}>
      <View className={styles.modal} catchMove>
        <View className={styles.modalHeader}>
          <Text className={styles.modalTitle}>{title}</Text>
          <Text className={styles.closeBtn} onClick={onClose}>×</Text>
        </View>
        <View className={styles.modalBody}>{children}</View>
        {showFooter && (
          <View className={styles.modalFooter}>
            {showCancel && (
              <Text className={classnames(styles.btn, styles.btnCancel)} onClick={onClose}>
                {cancelText}
              </Text>
            )}
            <Text
              className={classnames(
                styles.btn,
                confirmType === 'danger' ? styles.btnDanger : styles.btnConfirm
              )}
              onClick={onConfirm}
            >
              {confirmText}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default Modal;

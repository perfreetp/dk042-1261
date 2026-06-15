import React, { useState } from 'react';
import { View, Text, ITouchEvent } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface ModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onConfirm?: () => boolean | Promise<boolean> | void | Promise<void>;
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
  const [confirming, setConfirming] = useState(false);

  if (!visible) return null;

  const handleMaskClick = (_e: ITouchEvent) => {
    onClose();
  };

  const handleModalClick = (e: ITouchEvent) => {
    e.stopPropagation();
  };

  const handleConfirmClick = async () => {
    if (!onConfirm || confirming) return;
    setConfirming(true);
    try {
      const result = await onConfirm();
      if (result === true || result === undefined || result === null) {
        onClose();
      }
    } finally {
      setConfirming(false);
    }
  };

  return (
    <View className={styles.mask} onClick={handleMaskClick}>
      <View className={styles.modal} onClick={handleModalClick} catchMove>
        <View className={styles.modalHeader}>
          <Text className={styles.modalTitle}>{title}</Text>
          <Text className={styles.closeBtn} onClick={onClose}>×</Text>
        </View>
        <View className={styles.modalBody} onClick={handleModalClick}>{children}</View>
        {showFooter && (
          <View className={styles.modalFooter} onClick={handleModalClick}>
            {showCancel && (
              <Text className={classnames(styles.btn, styles.btnCancel)} onClick={onClose}>
                {cancelText}
              </Text>
            )}
            <Text
              className={classnames(
                styles.btn,
                confirmType === 'danger' ? styles.btnDanger : styles.btnConfirm,
                confirming && styles.btnDisabled
              )}
              onClick={handleConfirmClick}
            >
              {confirming ? '处理中...' : confirmText}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default Modal;

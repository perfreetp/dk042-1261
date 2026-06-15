import React from 'react';
import { View, Text, Input, Textarea } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, required, error, hint, className, children }) => {
  return (
    <View className={classnames(styles.field, className)}>
      {label && (
        <Text className={styles.label}>
          {required && <Text className={styles.required}>*</Text>}
          {label}
        </Text>
      )}
      {children}
      {error && <Text className={styles.error}>{error}</Text>}
      {hint && !error && <Text className={styles.hint}>{hint}</Text>}
    </View>
  );
};

interface FormInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'digit' | 'idcard';
  disabled?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false
}) => {
  return (
    <Input
      className={classnames(styles.input, disabled && styles.inputDisabled)}
      value={value}
      onInput={(e) => onChange(e.detail.value)}
      placeholder={placeholder}
      type={type}
      disabled={disabled}
    />
  );
};

interface FormTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  onBlur?: () => void;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  value,
  onChange,
  placeholder,
  maxLength,
  onBlur
}) => {
  return (
    <Textarea
      className={styles.textarea}
      value={value}
      onInput={(e) => onChange(e.detail.value)}
      placeholder={placeholder}
      maxlength={maxLength}
      onBlur={onBlur}
    />
  );
};

interface OptionItem {
  label: string;
  value: string;
}

interface FormPickerProps {
  value: string;
  onChange: (value: string) => void;
  options: OptionItem[];
}

export const FormPicker: React.FC<FormPickerProps> = ({ value, onChange, options }) => {
  return (
    <View className={styles.pickerOptions}>
      {options.map((opt) => (
        <Text
          key={opt.value}
          className={classnames(
            styles.pickerOption,
            value === opt.value && styles.pickerOptionActive
          )}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </Text>
      ))}
    </View>
  );
};

interface FormCheckboxGroupProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: OptionItem[];
}

export const FormCheckboxGroup: React.FC<FormCheckboxGroupProps> = ({
  value,
  onChange,
  options
}) => {
  const toggle = (optValue: string) => {
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue));
    } else {
      onChange([...value, optValue]);
    }
  };

  return (
    <View className={styles.checkboxGroup}>
      {options.map((opt) => {
        const isActive = value.includes(opt.value);
        return (
          <View
            key={opt.value}
            className={classnames(
              styles.checkboxItem,
              isActive && styles.checkboxItemActive
            )}
            onClick={() => toggle(opt.value)}
          >
            <View
              className={classnames(
                styles.checkboxTick,
                isActive && styles.checkboxTickActive
              )}
            >
              {isActive && '✓'}
            </View>
            {opt.label}
          </View>
        );
      })}
    </View>
  );
};

export default FormField;

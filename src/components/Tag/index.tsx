import React from 'react';
import { Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export type TagType = 'primary' | 'success' | 'warning' | 'error' | 'default' | 'secondary';

interface TagProps {
  type?: TagType;
  color?: string;
  bgColor?: string;
  children: React.ReactNode;
}

const Tag: React.FC<TagProps> = ({ type = 'default', color, bgColor, children }) => {
  const customStyle: React.CSSProperties = {};
  if (color) customStyle.color = color;
  if (bgColor) customStyle.backgroundColor = bgColor;

  return (
    <Text
      className={classnames(styles.tag, styles[type])}
      style={customStyle}
    >
      {children}
    </Text>
  );
};

export default Tag;

import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { useAppStore } from '@/store';
import { formatMoney, formatDate } from '@/utils';
import Tag from '@/components/Tag';
import SectionTitle from '@/components/SectionTitle';
import styles from './index.module.scss';

const ProfilePage: React.FC = () => {
  const { rentalProfile } = useAppStore();
  const { roommates } = rentalProfile;

  const totalRatio = useMemo(
    () => roommates.reduce((sum, r) => sum + r.shareRatio, 0),
    [roommates]
  );

  const cycleLabel = {
    monthly: '月付',
    quarterly: '季付',
    yearly: '年付'
  }[rentalProfile.paymentCycle];

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.hero}>
        <View className={styles.addressRow}>
          <Text className={styles.addressIcon}>📍</Text>
          <Text className={styles.addressText}>{rentalProfile.address}</Text>
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{formatMoney(rentalProfile.totalRent)}</Text>
            <Text className={styles.statLabel}>月租金</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{formatMoney(rentalProfile.deposit)}</Text>
            <Text className={styles.statLabel}>押金</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{roommates.length}人</Text>
            <Text className={styles.statLabel}>合租人数</Text>
          </View>
        </View>
      </View>

      <View className={styles.contentArea}>
        <SectionTitle title="房屋信息" />
        <View className={styles.infoCard}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>房屋面积</Text>
            <Text className={styles.infoValue}>{rentalProfile.totalArea} ㎡</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>付款日</Text>
            <Text className={styles.infoValue}>
              每月 {rentalProfile.paymentDay} 日
              <Text className={styles.paymentBadge} style={{ marginLeft: 16 }}>{cycleLabel}</Text>
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>起租日期</Text>
            <Text className={styles.infoValue}>{formatDate(rentalProfile.leaseStart)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>到期日期</Text>
            <Text className={styles.infoValue}>{formatDate(rentalProfile.leaseEnd)}</Text>
          </View>
        </View>

        <SectionTitle
          title="室友信息"
          actionText={`分摊比例 ${(totalRatio * 100).toFixed(0)}%`}
        />
        <View className={styles.roommateCard}>
          {roommates.map((roommate, index) => (
            <View key={roommate.id} className={styles.roommateItem}>
              <View className={styles.avatar}>
                <Text className={styles.avatarText}>{roommate.name.charAt(0)}</Text>
              </View>
              <View className={styles.roommateInfo}>
                <View className={styles.roommateNameRow}>
                  <Text className={styles.roommateName}>{roommate.name}</Text>
                  {index === 0 && <Tag type="primary">主联系人</Tag>}
                </View>
                <Text className={styles.roommateMeta}>
                  房间 {roommate.roomArea}㎡ · 入住 {formatDate(roommate.moveInDate)}
                </Text>
                <View className={styles.ratioBar}>
                  <View
                    className={styles.ratioFill}
                    style={{ width: `${roommate.shareRatio * 100}%` }}
                  />
                </View>
                <View className={styles.ratioText}>
                  <Text className={styles.ratioLabel}>费用分摊比例</Text>
                  <Text className={styles.ratioValue}>
                    {(roommate.shareRatio * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <SectionTitle title="房东/中介" />
        <View className={styles.landlordCard}>
          {rentalProfile.landlordName && (
            <View className={styles.contactRow}>
              <Text className={styles.contactLabel}>房东姓名</Text>
              <Text className={styles.contactValue}>{rentalProfile.landlordName}</Text>
            </View>
          )}
          {rentalProfile.landlordPhone && (
            <View className={styles.contactRow}>
              <Text className={styles.contactLabel}>联系电话</Text>
              <Text className={styles.contactValue}>{rentalProfile.landlordPhone}</Text>
            </View>
          )}
          {rentalProfile.agency && (
            <View className={styles.contactRow}>
              <Text className={styles.contactLabel}>中介公司</Text>
              <Text className={styles.contactValue}>{rentalProfile.agency}</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfilePage;

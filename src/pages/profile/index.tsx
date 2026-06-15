import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store';
import { formatMoney, formatDate, validateShareRatios } from '@/utils';
import type { RentalProfile, Roommate } from '@/types';
import Tag from '@/components/Tag';
import SectionTitle from '@/components/SectionTitle';
import Modal from '@/components/Modal';
import { FormField, FormInput, FormPicker } from '@/components/FormField';
import styles from './index.module.scss';
import classnames from 'classnames';

const emptyRoommate: Omit<Roommate, 'id'> = {
  name: '',
  phone: '',
  roomArea: 15,
  shareRatio: 0.33,
  moveInDate: new Date().toISOString().split('T')[0]
};

const ProfilePage: React.FC = () => {
  const {
    rentalProfile,
    updateRentalProfile,
    addRoommate,
    updateRoommate,
    removeRoommate
  } = useAppStore();
  const { roommates } = rentalProfile;

  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [editRoommateVisible, setEditRoommateVisible] = useState(false);
  const [editingRoommate, setEditingRoommate] = useState<Roommate | null>(null);
  const [profileForm, setProfileForm] = useState<Partial<RentalProfile>>({});
  const [roommateForm, setRoommateForm] = useState<Omit<Roommate, 'id'>>(emptyRoommate);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [roommateErrors, setRoommateErrors] = useState<Record<string, string>>({});

  const totalRatio = useMemo(
    () => roommates.reduce((sum, r) => sum + r.shareRatio, 0),
    [roommates]
  );
  const ratioValid = validateShareRatios(roommates.map((r) => r.shareRatio));

  const cycleLabel = {
    monthly: '月付',
    quarterly: '季付',
    yearly: '年付'
  }[rentalProfile.paymentCycle];

  const openEditProfile = () => {
    setProfileForm({
      address: rentalProfile.address,
      totalArea: rentalProfile.totalArea,
      totalRent: rentalProfile.totalRent,
      deposit: rentalProfile.deposit,
      leaseStart: rentalProfile.leaseStart,
      leaseEnd: rentalProfile.leaseEnd,
      paymentDay: rentalProfile.paymentDay,
      paymentCycle: rentalProfile.paymentCycle,
      landlordName: rentalProfile.landlordName,
      landlordPhone: rentalProfile.landlordPhone,
      agency: rentalProfile.agency
    });
    setProfileErrors({});
    setEditProfileVisible(true);
  };

  const saveProfile = () => {
    const errors: Record<string, string> = {};
    if (!profileForm.address?.trim()) errors.address = '请输入房屋地址';
    if (!profileForm.totalArea || profileForm.totalArea <= 0) errors.totalArea = '请输入有效面积';
    if (!profileForm.totalRent || profileForm.totalRent <= 0) errors.totalRent = '请输入有效租金';
    if (profileForm.deposit == null || profileForm.deposit < 0) errors.deposit = '请输入有效押金';
    if (!profileForm.leaseStart) errors.leaseStart = '请选择起租日期';
    if (!profileForm.leaseEnd) errors.leaseEnd = '请选择到期日期';
    if (!profileForm.paymentDay || profileForm.paymentDay < 1 || profileForm.paymentDay > 31) {
      errors.paymentDay = '请输入1-31之间的付款日';
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return false;
    }

    updateRentalProfile(profileForm as RentalProfile);
  };

  const openAddRoommate = () => {
    setEditingRoommate(null);
    setRoommateForm({ ...emptyRoommate });
    setRoommateErrors({});
    setEditRoommateVisible(true);
  };

  const openEditRoommate = (roommate: Roommate) => {
    setEditingRoommate(roommate);
    setRoommateForm({
      name: roommate.name,
      phone: roommate.phone || '',
      roomArea: roommate.roomArea,
      shareRatio: roommate.shareRatio,
      moveInDate: roommate.moveInDate
    });
    setRoommateErrors({});
    setEditRoommateVisible(true);
  };

  const saveRoommate = () => {
    const errors: Record<string, string> = {};
    if (!roommateForm.name.trim()) errors.name = '请输入室友姓名';
    if (!roommateForm.roomArea || roommateForm.roomArea <= 0) errors.roomArea = '请输入有效房间面积';
    if (!roommateForm.shareRatio || roommateForm.shareRatio <= 0 || roommateForm.shareRatio > 1) {
      errors.shareRatio = '分摊比例应在0-1之间';
    }
    if (!roommateForm.moveInDate) errors.moveInDate = '请选择入住日期';

    if (Object.keys(errors).length > 0) {
      setRoommateErrors(errors);
      return false;
    }

    if (editingRoommate) {
      updateRoommate(editingRoommate.id, roommateForm);
    } else {
      addRoommate(roommateForm);
    }
  };

  const handleRemoveRoommate = async (id: string) => {
    if (roommates.length <= 1) {
      Taro.showToast({ title: '至少需要保留一位室友', icon: 'none' });
      return;
    }
    const res = await Taro.showModal({
      title: '确认删除',
      content: '确定要删除这位室友吗？'
    });
    if (res.confirm) {
      removeRoommate(id);
    }
  };

  const paymentCycleOptions = [
    { label: '月付', value: 'monthly' },
    { label: '季付', value: 'quarterly' },
    { label: '年付', value: 'yearly' }
  ];

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.hero}>
        <View className={styles.addressRow}>
          <Text className={styles.addressIcon}>📍</Text>
          <Text className={styles.addressText}>{rentalProfile.address}</Text>
          <Text className={styles.editBtn} onClick={openEditProfile}>编辑</Text>
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
        <SectionTitle title="房屋信息" actionText="编辑" onAction={openEditProfile} />
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
          actionText={ratioValid ? `分摊比例 ${(totalRatio * 100).toFixed(0)}% ✓` : `分摊比例 ${(totalRatio * 100).toFixed(0)}% ⚠️`}
          onAction={openAddRoommate}
        />
        {!ratioValid && (
          <View style={{ padding: '0 16px 12px', fontSize: 24, color: '#FF7D00' }}>
            ⚠️ 分摊比例合计应为100%，当前为 {(totalRatio * 100).toFixed(0)}%
          </View>
        )}
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
              <View className={styles.roommateActions}>
                <Text
                  className={styles.actionBtn}
                  onClick={() => openEditRoommate(roommate)}
                >
                  编辑
                </Text>
                <Text
                  className={classnames(styles.actionBtn, styles.actionDanger)}
                  onClick={() => handleRemoveRoommate(roommate.id)}
                >
                  删除
                </Text>
              </View>
            </View>
          ))}
          <View className={styles.addRoommateBtn} onClick={openAddRoommate}>
            <Text style={{ fontSize: 28, color: '#20C997' }}>+ 添加室友</Text>
          </View>
        </View>

        <SectionTitle title="房东/中介" actionText="编辑" onAction={openEditProfile} />
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
          {!rentalProfile.landlordName && !rentalProfile.landlordPhone && !rentalProfile.agency && (
            <Text style={{ color: '#86909C', textAlign: 'center', padding: '20px 0' }}>
              暂无房东信息，点击"编辑"添加
            </Text>
          )}
        </View>
      </View>

      <Modal
        visible={editProfileVisible}
        title="编辑房屋信息"
        onClose={() => setEditProfileVisible(false)}
        onConfirm={saveProfile}
        confirmText="保存"
      >
        <FormField label="房屋地址" required error={profileErrors.address}>
          <FormInput
            value={profileForm.address || ''}
            onChange={(v) => setProfileForm({ ...profileForm, address: v })}
            placeholder="请输入详细地址"
          />
        </FormField>

        <View className="formRow">
          <FormField label="房屋面积(㎡)" required error={profileErrors.totalArea} className="formCol">
            <FormInput
              value={String(profileForm.totalArea || '')}
              onChange={(v) => setProfileForm({ ...profileForm, totalArea: Number(v) })}
              placeholder="如：98"
              type="digit"
            />
          </FormField>
          <FormField label="月租金(元)" required error={profileErrors.totalRent} className="formCol">
            <FormInput
              value={String(profileForm.totalRent || '')}
              onChange={(v) => setProfileForm({ ...profileForm, totalRent: Number(v) })}
              placeholder="如：6800"
              type="digit"
            />
          </FormField>
        </View>

        <View className="formRow">
          <FormField label="押金(元)" required error={profileErrors.deposit} className="formCol">
            <FormInput
              value={String(profileForm.deposit || '')}
              onChange={(v) => setProfileForm({ ...profileForm, deposit: Number(v) })}
              placeholder="如：13600"
              type="digit"
            />
          </FormField>
          <FormField label="付款日(每月)" required error={profileErrors.paymentDay} className="formCol">
            <FormInput
              value={String(profileForm.paymentDay || '')}
              onChange={(v) => setProfileForm({ ...profileForm, paymentDay: Number(v) })}
              placeholder="1-31"
              type="number"
            />
          </FormField>
        </View>

        <FormField label="付款周期" required>
          <FormPicker
            value={profileForm.paymentCycle || 'monthly'}
            onChange={(v) => setProfileForm({ ...profileForm, paymentCycle: v as any })}
            options={paymentCycleOptions}
          />
        </FormField>

        <View className="formRow">
          <FormField label="起租日期" required error={profileErrors.leaseStart} className="formCol">
            <FormInput
              value={profileForm.leaseStart || ''}
              onChange={(v) => setProfileForm({ ...profileForm, leaseStart: v })}
              placeholder="YYYY-MM-DD"
            />
          </FormField>
          <FormField label="到期日期" required error={profileErrors.leaseEnd} className="formCol">
            <FormInput
              value={profileForm.leaseEnd || ''}
              onChange={(v) => setProfileForm({ ...profileForm, leaseEnd: v })}
              placeholder="YYYY-MM-DD"
            />
          </FormField>
        </View>

        <FormField label="房东姓名">
          <FormInput
            value={profileForm.landlordName || ''}
            onChange={(v) => setProfileForm({ ...profileForm, landlordName: v })}
            placeholder="请输入房东姓名"
          />
        </FormField>

        <FormField label="联系电话">
          <FormInput
            value={profileForm.landlordPhone || ''}
            onChange={(v) => setProfileForm({ ...profileForm, landlordPhone: v })}
            placeholder="请输入联系电话"
          />
        </FormField>

        <FormField label="中介公司">
          <FormInput
            value={profileForm.agency || ''}
            onChange={(v) => setProfileForm({ ...profileForm, agency: v })}
            placeholder="选填"
          />
        </FormField>
      </Modal>

      <Modal
        visible={editRoommateVisible}
        title={editingRoommate ? '编辑室友信息' : '添加室友'}
        onClose={() => setEditRoommateVisible(false)}
        onConfirm={saveRoommate}
        confirmText="保存"
      >
        <FormField label="室友姓名" required error={roommateErrors.name}>
          <FormInput
            value={roommateForm.name}
            onChange={(v) => setRoommateForm({ ...roommateForm, name: v })}
            placeholder="请输入姓名"
          />
        </FormField>

        <View className="formRow">
          <FormField label="房间面积(㎡)" required error={roommateErrors.roomArea} className="formCol">
            <FormInput
              value={String(roommateForm.roomArea)}
              onChange={(v) => setRoommateForm({ ...roommateForm, roomArea: Number(v) })}
              placeholder="如：15"
              type="digit"
            />
          </FormField>
          <FormField label="分摊比例(%)" required error={roommateErrors.shareRatio} className="formCol">
            <FormInput
              value={String(Math.round(roommateForm.shareRatio * 100))}
              onChange={(v) => setRoommateForm({ ...roommateForm, shareRatio: Number(v) / 100 })}
              placeholder="如：33"
              type="number"
            />
          </FormField>
        </View>

        <FormField label="入住日期" required error={roommateErrors.moveInDate}>
          <FormInput
            value={roommateForm.moveInDate}
            onChange={(v) => setRoommateForm({ ...roommateForm, moveInDate: v })}
            placeholder="YYYY-MM-DD"
          />
        </FormField>

        <FormField label="联系电话">
          <FormInput
            value={roommateForm.phone || ''}
            onChange={(v) => setRoommateForm({ ...roommateForm, phone: v })}
            placeholder="选填"
          />
        </FormField>

        <Text style={{ fontSize: 24, color: '#86909C' }}>
          💡 提示：所有室友分摊比例之和应为100%
        </Text>
      </Modal>
    </ScrollView>
  );
};

export default ProfilePage;

/**
 * @file ModalSheet.tsx
 * @description 어두운 반투명 백드롭, 키보드 회피, 상단 헤더(아이브로우·제목·부제목·닫기 버튼),
 * 하단 액션 영역을 표준화한 공통 모달 시트 래퍼 컴포넌트입니다.
 */
import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { commonStyles } from '../../theme/commonStyles';
import { radius, spacing, tabularNums, theme, typography } from '../../theme/tokens';

interface ModalSheetProps {
  visible: boolean;
  /** 상단 작은 분류 라벨 (예: '구매 금액 확인', '장보기 목록에 추가') */
  eyebrow: string;
  /** 모달 주 제목 */
  title: string;
  /** 제목 아래 보조 정보 (선택) */
  subtitle?: string;
  onClose: () => void;
  /** 본문 입력 필드 영역 */
  children: React.ReactNode;
  /** 하단 버튼 영역 (취소/확인 등) */
  footer: React.ReactNode;
}

export function ModalSheet({
  visible,
  eyebrow,
  title,
  subtitle,
  onClose,
  children,
  footer,
}: ModalSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={[typography.labelSm, commonStyles.textPrimary]}>
                {eyebrow}
              </Text>
              <Text style={[typography.headlineMd, commonStyles.textOnSurface]}>
                {title}
              </Text>
              {subtitle ? (
                <Text
                  style={[typography.bodyMd, tabularNums, commonStyles.textMuted]}
                >
                  {subtitle}
                </Text>
              ) : null}
            </View>
            <Pressable
              onPress={onClose}
              accessibilityLabel="팝업 닫기"
              style={styles.closeBtn}
            >
              <MaterialIcons name="close" size={20} color={theme.onSurface} />
            </Pressable>
          </View>

          <View style={styles.body}>{children}</View>

          <View style={styles.footer}>{footer}</View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(22, 29, 25, 0.45)',
    justifyContent: 'center',
    padding: spacing.pageMargin,
  },
  sheet: {
    backgroundColor: theme.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: theme.outlineVariant,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: theme.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    gap: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});

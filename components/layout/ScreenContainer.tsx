import React, { ReactNode } from 'react';
import { View, ScrollView, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';

interface ScreenContainerProps {
  children: ReactNode;
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  padded?: boolean;
  keyboardAvoiding?: boolean;
  className?: string;
  contentClassName?: string;
}

export function ScreenContainer({
  children,
  scrollable = true,
  refreshing = false,
  onRefresh,
  edges = ['top'],
  padded = true,
  keyboardAvoiding = false,
  className = '',
  contentClassName = '',
}: ScreenContainerProps) {
  const content = scrollable ? (
    <ScrollView
      className={`flex-1 ${padded ? 'px-4' : ''} ${contentClassName}`}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.indigo[600]}
            colors={[colors.indigo[600]]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 ${padded ? 'px-4' : ''} ${contentClassName}`}>
      {children}
    </View>
  );

  const wrappedContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  return (
    <SafeAreaView edges={edges} className={`flex-1 bg-slate-50 ${className}`}>
      {wrappedContent}
    </SafeAreaView>
  );
}

import React, { type PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard, KeyboardAvoidingView, Platform, ScrollView, View, type KeyboardMetrics } from 'react-native';

export function AuthFormScrollView({ children }: PropsWithChildren) {
  const viewport = useRef<View>(null);
  const keyboardTop = useRef<number | null>(null);
  const [overlap, setOverlap] = useState(0);

  const measureOverlap = useCallback(() => {
    const top = keyboardTop.current;
    if (top === null) return;
    viewport.current?.measureInWindow((_x, y, _width, height) => {
      if (keyboardTop.current === top) setOverlap(Math.max(0, y + height - top));
    });
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = (frame: KeyboardMetrics) => {
      // Edge-to-edge windows can report their full height with the IME open.
      const estimatedTop = Dimensions.get('screen').height - frame.height;
      keyboardTop.current = frame.screenY > 0 ? Math.min(frame.screenY, estimatedTop) : estimatedTop;
      measureOverlap();
    };
    const shown = Keyboard.addListener('keyboardDidShow', (event) => show(event.endCoordinates));
    const hidden = Keyboard.addListener('keyboardDidHide', () => {
      keyboardTop.current = null;
      setOverlap(0);
    });
    const initial = Keyboard.metrics();
    if (initial) show(initial);
    return () => {
      shown.remove();
      hidden.remove();
      keyboardTop.current = null;
    };
  }, [measureOverlap]);

  const form = (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 24 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );

  if (Platform.OS === 'ios') {
    return <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>{form}</KeyboardAvoidingView>;
  }
  return (
    <View ref={viewport} collapsable={false} onLayout={measureOverlap} style={{ flex: 1, paddingBottom: overlap }}>
      {form}
    </View>
  );
}

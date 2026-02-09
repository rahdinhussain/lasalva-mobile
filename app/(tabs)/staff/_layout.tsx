import { Stack } from 'expo-router';

export default function StaffLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add" />
      <Stack.Screen name="[staffId]/index" />
      <Stack.Screen name="[staffId]/edit" />
      <Stack.Screen name="[staffId]/schedule" />
    </Stack>
  );
}

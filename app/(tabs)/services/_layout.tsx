import { Stack } from 'expo-router';

export default function ServicesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="add" />
      <Stack.Screen name="[serviceId]/index" />
      <Stack.Screen name="[serviceId]/edit" />
    </Stack>
  );
}

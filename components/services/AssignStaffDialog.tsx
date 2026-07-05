import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Check, Search } from 'lucide-react-native';
import { Profile } from '@/types';
import { useStaffList } from '@/hooks/useStaff';
import { Avatar, Button, Input } from '@/components/ui';
import { colors } from '@/constants/colors';
import { themeColor } from '@/utils/themeColor';

interface AssignStaffDialogProps {
  visible: boolean;
  onClose: () => void;
  assignedStaffIds: string[];
  onSave: (staffIds: string[]) => Promise<void>;
}

export function AssignStaffDialog({
  visible,
  onClose,
  assignedStaffIds,
  onSave,
}: AssignStaffDialogProps) {
  const insets = useSafeAreaInsets();
  const { staff } = useStaffList();
  const [selectedIds, setSelectedIds] = useState<string[]>(assignedStaffIds);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedIds(assignedStaffIds);
  }, [assignedStaffIds, visible]);

  const filteredStaff = staff.filter((s) =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStaff = (staffId: string) => {
    setSelectedIds((prev) =>
      prev.includes(staffId)
        ? prev.filter((id) => id !== staffId)
        : [...prev, staffId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedIds);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const renderStaffItem = (item: Profile) => {
    const isSelected = selectedIds.includes(item.id);

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => toggleStaff(item.id)}
        className={`flex-row items-center p-3 mx-4 rounded-xl mb-2 ${
          isSelected ? 'bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/40' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
        }`}
      >
        <Avatar source={item.profile_photo_url} name={item.name} size="md" />
        <View className="flex-1 ml-3">
          <Text className="text-base font-medium text-slate-900 dark:text-slate-50">
            {item.name || 'Unnamed'}
          </Text>
          {item.designation && (
            <Text className="text-sm text-slate-500 dark:text-slate-400">{item.designation}</Text>
          )}
        </View>
        <View
          className={`w-6 h-6 rounded-full items-center justify-center ${
            isSelected ? 'bg-indigo-600' : 'border-2 border-slate-300 dark:border-slate-600'
          }`}
        >
          {isSelected && <Check size={14} color="white" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-slate-50 dark:bg-slate-900 rounded-t-3xl max-h-[80%]">
          {/* Handle */}
          <View className="items-center pt-3 pb-2">
            <View className="w-10 h-1 bg-slate-300 rounded-full" />
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between px-4 pb-3 border-b border-slate-200 dark:border-slate-700">
            <Text className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Assign Staff
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2 -mr-2">
              <X size={24} color={themeColor().textMuted} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View className="px-4 py-3">
            <Input
              placeholder="Search staff..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={<Search size={20} color={themeColor().textMuted} />}
            />
          </View>

          {/* Staff List */}
          <ScrollView
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {filteredStaff.length === 0 ? (
              <View className="items-center py-8">
                <Text className="text-slate-500 dark:text-slate-400">No staff found</Text>
              </View>
            ) : (
              filteredStaff.map((item) => renderStaffItem(item))
            )}
          </ScrollView>

          {/* Footer */}
          <View
            className="px-4 pt-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            <View className="flex-row gap-3">
              <Button variant="secondary" className="flex-1" onPress={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                loading={isSaving}
                onPress={handleSave}
              >
                Save ({selectedIds.length})
              </Button>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

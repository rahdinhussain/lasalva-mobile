import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  label,
  placeholder = 'Select an option',
  value,
  options,
  onChange,
  error,
  disabled = false,
  className = '',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <View className={className}>
      {label && (
        <Text className="text-sm font-medium text-slate-700 mb-1.5">{label}</Text>
      )}
      <TouchableOpacity
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={`
          flex-row items-center justify-between bg-white rounded-xl border px-3 py-3
          ${error ? 'border-rose-500' : 'border-slate-200'}
          ${disabled ? 'opacity-50' : ''}
        `}
      >
        <Text
          className={`text-base ${selectedOption ? 'text-slate-900' : 'text-slate-500'}`}
        >
          {selectedOption?.label || placeholder}
        </Text>
        <ChevronDown size={20} color={colors.slate[500]} />
      </TouchableOpacity>
      {error && (
        <Text className="text-sm text-rose-600 mt-1">{error}</Text>
      )}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
          className="flex-1 justify-end bg-black/50"
        >
          <View className="bg-white rounded-t-3xl max-h-[60%]">
            <View className="items-center py-3">
              <View className="w-10 h-1 bg-slate-300 rounded-full" />
            </View>
            {label && (
              <Text className="text-lg font-semibold text-slate-900 px-4 pb-2">
                {label}
              </Text>
            )}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 32 }}
            >
              {options.map((item, index) => (
                <View key={item.value}>
                  <TouchableOpacity
                    onPress={() => handleSelect(item.value)}
                    className="flex-row items-center justify-between px-4 py-3"
                  >
                    <Text
                      className={`text-base ${
                        item.value === value ? 'text-indigo-600 font-medium' : 'text-slate-900'
                      }`}
                    >
                      {item.label}
                    </Text>
                    {item.value === value && (
                      <Check size={20} color={colors.indigo[600]} />
                    )}
                  </TouchableOpacity>
                  {index < options.length - 1 && (
                    <View className="h-px bg-slate-100 mx-4" />
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

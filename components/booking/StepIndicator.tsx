import React from 'react';
import { View, Text } from 'react-native';

const STEP_LABELS = ['Service', 'Staff', 'Date', 'Time', 'Details', 'Done'];

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  skipStaff?: boolean;
}

export function StepIndicator({ currentStep, totalSteps, skipStaff }: StepIndicatorProps) {
  const labels = skipStaff
    ? STEP_LABELS.filter((_, i) => i !== 1)
    : STEP_LABELS;

  return (
    <View className="flex-row items-center px-4 pt-2 pb-3 mb-1 border-b border-slate-100">
      {labels.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <React.Fragment key={label}>
            {index > 0 && (
              <View
                className={`flex-1 h-0.5 ${
                  isCompleted ? 'bg-indigo-300' : 'bg-slate-200'
                }`}
              />
            )}
            <View className="items-center" style={{ width: 40 }}>
              <View
                className={`w-2 h-2 rounded-full ${
                  isActive
                    ? 'bg-indigo-600'
                    : isCompleted
                    ? 'bg-indigo-300'
                    : 'bg-slate-200'
                }`}
              />
              <Text
                className={`text-[10px] mt-1 ${
                  isActive
                    ? 'text-indigo-600 font-medium'
                    : isCompleted
                    ? 'text-indigo-400'
                    : 'text-slate-400'
                }`}
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>
          </React.Fragment>
        );
      })}
    </View>
  );
}

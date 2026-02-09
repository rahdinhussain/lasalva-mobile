import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { format } from 'date-fns';
import { colors } from '@/constants/colors';
import { getDateKeyInTimeZone } from '@/utils/dateUtils';

const HOUR_HEIGHT = 60; // px per hour
const TIME_LABEL_WIDTH = 52;
const TOTAL_HOURS = 24;
const GRID_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT;

interface TimeGridProps {
  dates: Date[];
  children: React.ReactNode;
  columnWidth?: number;
  showCurrentTime?: boolean;
  timeZone?: string | null;
}

function formatHourLabel(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

export function TimeGrid({
  dates,
  children,
  columnWidth,
  showCurrentTime = true,
  timeZone,
}: TimeGridProps) {
  const scrollRef = useRef<ScrollView>(null);

  // Auto-scroll to 7 AM (or current time if today)
  useEffect(() => {
    // Use raw Date for todayKey (single TZ conversion), and format() for zoned dates from parent
    const todayKey = getDateKeyInTimeZone(new Date(), timeZone);
    const hasToday = dates.some((d) => format(d, 'yyyy-MM-dd') === todayKey);
    // Use device local time for scroll position to match the current time indicator
    const localHour = new Date().getHours();
    const scrollToHour = hasToday ? Math.max(localHour - 1, 0) : 7;

    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: scrollToHour * HOUR_HEIGHT,
        animated: false,
      });
    }, 100);
  }, [dates, timeZone]);

  // Current time position - use device local time so the indicator shows "now" 
  // relative to the user's actual day, regardless of business timezone
  const now = new Date();
  const nowHours = now.getHours();
  const nowMinutes = now.getMinutes();
  const currentTimeTop = nowHours * HOUR_HEIGHT + (nowMinutes / 60) * HOUR_HEIGHT;

  // Use raw Date for todayKey (single TZ conversion), and format() for zoned dates from parent
  const todayKey = getDateKeyInTimeZone(new Date(), timeZone);
  const hasToday = dates.some((d) => format(d, 'yyyy-MM-dd') === todayKey);
  const todayIndex = dates.findIndex((d) => format(d, 'yyyy-MM-dd') === todayKey);

  return (
    <ScrollView
      ref={scrollRef}
      className="flex-1"
      showsVerticalScrollIndicator={false}
    >
      <View style={{ height: GRID_HEIGHT, flexDirection: 'row' }}>
        {/* Time labels column */}
        <View style={{ width: TIME_LABEL_WIDTH }}>
          {Array.from({ length: TOTAL_HOURS }, (_, i) => (
            <View
              key={i}
              style={{ height: HOUR_HEIGHT, justifyContent: 'flex-start' }}
              className="pr-2 items-end"
            >
              <Text
                className="text-slate-400 font-medium"
                style={{ fontSize: 10, marginTop: -6 }}
              >
                {formatHourLabel(i)}
              </Text>
            </View>
          ))}
        </View>

        {/* Grid area */}
        <View className="flex-1 relative">
          {/* Hour grid lines */}
          {Array.from({ length: TOTAL_HOURS }, (_, i) => (
            <View
              key={i}
              className="border-t border-slate-100 absolute left-0 right-0"
              style={{ top: i * HOUR_HEIGHT }}
            />
          ))}

          {/* Half-hour grid lines (subtle) */}
          {Array.from({ length: TOTAL_HOURS }, (_, i) => (
            <View
              key={`half-${i}`}
              className="border-t border-slate-50 absolute left-0 right-0"
              style={{ top: i * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
            />
          ))}

          {/* Column dividers (for multi-day views) */}
          {dates.length > 1 &&
            dates.map((_, i) => {
              if (i === 0) return null;
              const left = columnWidth ? i * columnWidth : `${(i / dates.length) * 100}%`;
              return (
                <View
                  key={`divider-${i}`}
                  className="absolute top-0 bottom-0 border-l border-slate-100"
                  style={{ left: left as number }}
                />
              );
            })}

          {/* Current time indicator */}
          {showCurrentTime && hasToday && (
            <View
              className="absolute left-0 right-0 z-20"
              style={{ top: currentTimeTop }}
              pointerEvents="none"
            >
              {/* Position the line within the correct column for multi-day views */}
              {dates.length > 1 ? (
                <View
                  className="absolute flex-row items-center"
                  style={{
                    left: columnWidth
                      ? todayIndex * columnWidth
                      : `${(todayIndex / dates.length) * 100}%`,
                    width: columnWidth || `${100 / dates.length}%`,
                  }}
                >
                  <View
                    className="rounded-full"
                    style={{
                      width: 8,
                      height: 8,
                      backgroundColor: colors.rose[500],
                      marginLeft: -4,
                    }}
                  />
                  <View
                    className="flex-1"
                    style={{ height: 2, backgroundColor: colors.rose[500] }}
                  />
                </View>
              ) : (
                <View className="flex-row items-center">
                  <View
                    className="rounded-full"
                    style={{
                      width: 8,
                      height: 8,
                      backgroundColor: colors.rose[500],
                      marginLeft: -4,
                    }}
                  />
                  <View
                    className="flex-1"
                    style={{ height: 2, backgroundColor: colors.rose[500] }}
                  />
                </View>
              )}
            </View>
          )}

          {/* Appointment blocks (rendered by parent) */}
          {children}
        </View>
      </View>
    </ScrollView>
  );
}

export { HOUR_HEIGHT, TIME_LABEL_WIDTH, GRID_HEIGHT };

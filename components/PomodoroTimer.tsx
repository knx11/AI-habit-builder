import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView, Modal, Dimensions } from 'react-native';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import * as Haptics from 'expo-haptics';

interface PomodoroTimerProps {
  taskId?: string;
}

type TimerState = 'work' | 'shortBreak' | 'longBreak';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;

export default function PomodoroTimer({ taskId }: PomodoroTimerProps) {
  const { pomodoroSettings } = useTaskStore();
  const [timerState, setTimerState] = useState<TimerState>('work');
  const [timeLeft, setTimeLeft] = useState(pomodoroSettings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState(1);
  const [progress, setProgress] = useState(0);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Time picker state - now using hours and minutes
  const [selectedHours, setSelectedHours] = useState(Math.floor(timeLeft / 3600));
  const [selectedMinutes, setSelectedMinutes] = useState(Math.floor((timeLeft % 3600) / 60));
  
  // Refs for scroll views
  const hoursScrollRef = useRef<ScrollView>(null);
  const minutesScrollRef = useRef<ScrollView>(null);

  const getDuration = useCallback(() => {
    switch (timerState) {
      case 'work':
        return pomodoroSettings.workDuration * 60;
      case 'shortBreak':
        return pomodoroSettings.shortBreakDuration * 60;
      case 'longBreak':
        return pomodoroSettings.longBreakDuration * 60;
    }
  }, [pomodoroSettings, timerState]);

  useEffect(() => {
    setTimeLeft(getDuration());
  }, [timerState, getDuration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });

        setProgress((prev) => {
          const duration = getDuration();
          return ((duration - (timeLeft - 1)) / duration) * 100;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    setIsRunning(false);
    
    if (timerState === 'work') {
      if (currentSession % pomodoroSettings.sessionsBeforeLongBreak === 0) {
        setTimerState('longBreak');
      } else {
        setTimerState('shortBreak');
      }
    } else {
      setTimerState('work');
      if (timerState === 'longBreak') {
        setCurrentSession(1);
      } else {
        setCurrentSession((prev) => prev + 1);
      }
    }
  };

  const toggleTimer = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsRunning(false);
    setTimeLeft(getDuration());
    setProgress(0);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStateColor = (state: TimerState) => {
    switch (state) {
      case 'work':
        return colors.primary;
      case 'shortBreak':
        return colors.secondary;
      case 'longBreak':
        return colors.accent;
    }
  };
  
  const openTimePicker = () => {
    if (isRunning) return; // Don't allow time adjustment while timer is running
    
    setSelectedHours(Math.floor(timeLeft / 3600));
    setSelectedMinutes(Math.floor((timeLeft % 3600) / 60));
    setShowTimePicker(true);
    
    // Scroll to the current values
    setTimeout(() => {
      hoursScrollRef.current?.scrollTo({ 
        y: selectedHours * ITEM_HEIGHT, 
        animated: false 
      });
      minutesScrollRef.current?.scrollTo({ 
        y: selectedMinutes * ITEM_HEIGHT, 
        animated: false 
      });
    }, 100);
  };
  
  const applyTimeSelection = () => {
    const newTimeInSeconds = (selectedHours * 3600) + (selectedMinutes * 60);
    setTimeLeft(newTimeInSeconds);
    setProgress(0);
    setShowTimePicker(false);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  
  const handleHourScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    setSelectedHours(index);
  };
  
  const handleMinuteScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    setSelectedMinutes(index);
  };
  
  // Generate arrays for hours and minutes
  const hours = Array.from({ length: 10 }, (_, i) => i); // 0-9 hours
  const minutes = Array.from({ length: 60 }, (_, i) => i); // 0-59 minutes

  return (
    <View style={styles.container}>
      <View style={styles.timerStatesContainer}>
        <TouchableOpacity
          style={[
            styles.stateButton,
            timerState === 'work' && { backgroundColor: colors.primary },
          ]}
          onPress={() => {
            setTimerState('work');
            resetTimer();
          }}
        >
          <Text
            style={[
              styles.stateText,
              timerState === 'work' && styles.activeStateText,
            ]}
          >
            Work
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.stateButton,
            timerState === 'shortBreak' && { backgroundColor: colors.secondary },
          ]}
          onPress={() => {
            setTimerState('shortBreak');
            resetTimer();
          }}
        >
          <Text
            style={[
              styles.stateText,
              timerState === 'shortBreak' && styles.activeStateText,
            ]}
          >
            Short Break
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.stateButton,
            timerState === 'longBreak' && { backgroundColor: colors.accent },
          ]}
          onPress={() => {
            setTimerState('longBreak');
            resetTimer();
          }}
        >
          <Text
            style={[
              styles.stateText,
              timerState === 'longBreak' && styles.activeStateText,
            ]}
          >
            Long Break
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timerContainer}>
        <TouchableOpacity
          onPress={isRunning ? toggleTimer : openTimePicker}
          activeOpacity={0.8}
          style={styles.timerCircle}
        >
          <View
            style={[
              styles.progressCircle,
              {
                width: 240,
                height: 240,
                borderRadius: 120,
                borderColor: getStateColor(timerState),
              },
            ]}
          />
          {progress > 0 && (
            <View
              style={[
                styles.progressArc,
                {
                  width: 240,
                  height: 240,
                  borderRadius: 120,
                  transform: [{ rotate: `${progress * 3.6}deg` }],
                  borderTopColor: getStateColor(timerState),
                },
              ]}
            />
          )}
          <View style={styles.timerInner}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            <Text style={styles.sessionText}>Session {currentSession}</Text>
            <Text style={styles.tapHint}>
              {isRunning ? 'Tap to pause' : 'Tap to adjust time'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={resetTimer} style={styles.controlButton}>
          <RotateCcw size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleTimer} style={styles.playButton}>
          {isRunning ? (
            <Pause size={32} color={colors.background} />
          ) : (
            <Play size={32} color={colors.background} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setTimerState(timerState === 'work' ? 'shortBreak' : 'work');
            resetTimer();
          }}
          style={styles.controlButton}
        >
          <Coffee size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      {/* Time Picker Modal - Hours and Minutes only */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Adjust Timer</Text>
            
            <View style={styles.pickerContent}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Hours</Text>
                <View style={styles.pickerScrollContainer}>
                  <View style={styles.pickerHighlight} />
                  <ScrollView
                    ref={hoursScrollRef}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    onMomentumScrollEnd={handleHourScroll}
                    contentContainerStyle={[
                      styles.pickerScrollContent,
                      { paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) }
                    ]}
                  >
                    {hours.map((hour) => (
                      <View key={`hour-${hour}`} style={styles.pickerItem}>
                        <Text
                          style={[
                            styles.pickerItemText,
                            selectedHours === hour && styles.pickerItemSelected,
                          ]}
                        >
                          {hour.toString().padStart(2, '0')}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
              
              <Text style={styles.pickerSeparator}>:</Text>
              
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Minutes</Text>
                <View style={styles.pickerScrollContainer}>
                  <View style={styles.pickerHighlight} />
                  <ScrollView
                    ref={minutesScrollRef}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    onMomentumScrollEnd={handleMinuteScroll}
                    contentContainerStyle={[
                      styles.pickerScrollContent,
                      { paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) }
                    ]}
                  >
                    {minutes.map((min) => (
                      <View key={`min-${min}`} style={styles.pickerItem}>
                        <Text
                          style={[
                            styles.pickerItemText,
                            selectedMinutes === min && styles.pickerItemSelected,
                          ]}
                        >
                          {min.toString().padStart(2, '0')}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>
            
            <View style={styles.pickerActions}>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.pickerButton, styles.pickerConfirmButton]}
                onPress={applyTimeSelection}
              >
                <Text style={styles.pickerConfirmText}>Set</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  timerStatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  stateButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeState: {
    backgroundColor: colors.primary,
  },
  stateText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
  },
  activeStateText: {
    color: colors.background,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
  },
  timerCircle: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressCircle: {
    position: 'absolute',
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressArc: {
    position: 'absolute',
    borderWidth: 8,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
  },
  timerInner: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  sessionText: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 4,
  },
  tapHint: {
    fontSize: 12,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 32,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  // Time Picker Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    width: SCREEN_WIDTH * 0.85,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pickerColumn: {
    alignItems: 'center',
    width: 80,
  },
  pickerLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  pickerScrollContainer: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    overflow: 'hidden',
    position: 'relative',
  },
  pickerHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: colors.border,
    opacity: 0.3,
    borderRadius: 8,
    zIndex: 1,
  },
  pickerScrollContent: {
    paddingHorizontal: 10,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 22,
    color: colors.text,
  },
  pickerItemSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  pickerSeparator: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 10,
  },
  pickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  pickerButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  pickerConfirmButton: {
    backgroundColor: colors.primary,
  },
  pickerCancelText: {
    fontSize: 16,
    color: colors.textLight,
  },
  pickerConfirmText: {
    fontSize: 16,
    color: colors.background,
    fontWeight: '600',
  },
});
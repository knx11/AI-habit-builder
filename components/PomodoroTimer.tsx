import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';

interface PomodoroTimerProps {
  taskId: string;
}

export default function PomodoroTimer({ taskId }: PomodoroTimerProps) {
  const { pomodoroSettings } = useTaskStore();
  const [timeLeft, setTimeLeft] = useState(pomodoroSettings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkTime, setIsWorkTime] = useState(true);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, timeLeft]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setTimeLeft(pomodoroSettings.workDuration * 60);
    setIsRunning(false);
    setIsWorkTime(true);
    setSessionCount(0);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerCircle}>
        <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
        <Text style={styles.phaseText}>
          {isWorkTime ? 'Work Time' : 'Break Time'}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={toggleTimer}
        >
          <Text style={styles.buttonText}>
            {isRunning ? 'Pause' : 'Start'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.resetButton]} 
          onPress={resetTimer}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  timerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: colors.primary,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
  },
  phaseText: {
    fontSize: 18,
    color: colors.textLight,
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  resetButton: {
    backgroundColor: colors.textLight,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
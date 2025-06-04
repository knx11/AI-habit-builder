import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Platform, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';

export default function SettingsScreen() {
  const { pomodoroSettings, updatePomodoroSettings } = useTaskStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const handleHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };

  const handleNotificationsToggle = (value: boolean) => {
    handleHapticFeedback();
    setNotificationsEnabled(value);
  };

  const handleSoundToggle = (value: boolean) => {
    handleHapticFeedback();
    setSoundEnabled(value);
  };

  const handleVibrationToggle = (value: boolean) => {
    handleHapticFeedback();
    setVibrationEnabled(value);
  };

  const handlePomodoroSettingChange = (key: keyof typeof pomodoroSettings, value: number) => {
    handleHapticFeedback();
    updatePomodoroSettings({
      ...pomodoroSettings,
      [key]: value,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Settings',
        }}
      />

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Enable Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sound & Haptics</Text>
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Sound Effects</Text>
            <Switch
              value={soundEnabled}
              onValueChange={handleSoundToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Vibration</Text>
            <Switch
              value={vibrationEnabled}
              onValueChange={handleVibrationToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pomodoro Timer</Text>
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Work Duration (minutes)</Text>
            <TouchableOpacity
              onPress={() => handlePomodoroSettingChange('workDuration', pomodoroSettings.workDuration + 5)}
              style={styles.button}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>{pomodoroSettings.workDuration}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Short Break (minutes)</Text>
            <TouchableOpacity
              onPress={() => handlePomodoroSettingChange('shortBreakDuration', pomodoroSettings.shortBreakDuration + 1)}
              style={styles.button}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>{pomodoroSettings.shortBreakDuration}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Long Break (minutes)</Text>
            <TouchableOpacity
              onPress={() => handlePomodoroSettingChange('longBreakDuration', pomodoroSettings.longBreakDuration + 5)}
              style={styles.button}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>{pomodoroSettings.longBreakDuration}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Sessions before Long Break</Text>
            <TouchableOpacity
              onPress={() => handlePomodoroSettingChange('sessionsBeforeLongBreak', pomodoroSettings.sessionsBeforeLongBreak + 1)}
              style={styles.button}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>{pomodoroSettings.sessionsBeforeLongBreak}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '500',
  },
});
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Switch,
  TextInput,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  Bell, 
  Calendar, 
  Trash2, 
  HelpCircle,
  ChevronRight,
  Share2,
  X,
  Moon,
  Sun
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import Button from '@/components/Button';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const router = useRouter();
  const { pomodoroSettings, updatePomodoroSettings } = useTaskStore();
  const [workDuration, setWorkDuration] = useState(pomodoroSettings.workDuration.toString());
  const [shortBreakDuration, setShortBreakDuration] = useState(
    pomodoroSettings.shortBreakDuration.toString()
  );
  const [longBreakDuration, setLongBreakDuration] = useState(
    pomodoroSettings.longBreakDuration.toString()
  );
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(
    pomodoroSettings.sessionsBeforeLongBreak.toString()
  );
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  
  const handleSaveSettings = () => {
    const settings = {
      workDuration: parseInt(workDuration) || 25,
      shortBreakDuration: parseInt(shortBreakDuration) || 5,
      longBreakDuration: parseInt(longBreakDuration) || 15,
      sessionsBeforeLongBreak: parseInt(sessionsBeforeLongBreak) || 4,
    };
    
    updatePomodoroSettings(settings);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    Alert.alert('Settings Saved', 'Your pomodoro settings have been updated.');
  };
  
  const confirmClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all your tasks and statistics? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Data Cleared', 'All your data has been deleted.');
          },
        },
      ]
    );
  };
  const [activeTab, setActiveTab] = useState<'General' | 'Appearance'>('General');

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Settings',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            color: colors.text,
          },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ marginLeft: 16 }}
              testID="settings-close"
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'General' ? styles.tabButtonActive : null]}
          onPress={() => setActiveTab('General')}
          testID="tab-general"
        >
          <Text style={[styles.tabButtonText, activeTab === 'General' ? styles.tabButtonTextActive : null]}>General</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Appearance' ? styles.tabButtonActive : null]}
          onPress={() => setActiveTab('Appearance')}
          testID="tab-appearance"
        >
          <Text style={[styles.tabButtonText, activeTab === 'Appearance' ? styles.tabButtonTextActive : null]}>Appearance</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {activeTab === 'General' ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pomodoro Timer</Text>
              
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Work Duration (minutes)</Text>
                <TextInput
                  style={styles.input}
                  value={workDuration}
                  onChangeText={setWorkDuration}
                  keyboardType="number-pad"
                  testID="work-duration-input"
                />
              </View>
              
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Short Break (minutes)</Text>
                <TextInput
                  style={styles.input}
                  value={shortBreakDuration}
                  onChangeText={setShortBreakDuration}
                  keyboardType="number-pad"
                  testID="short-break-input"
                />
              </View>
              
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Long Break (minutes)</Text>
                <TextInput
                  style={styles.input}
                  value={longBreakDuration}
                  onChangeText={setLongBreakDuration}
                  keyboardType="number-pad"
                  testID="long-break-input"
                />
              </View>
              
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Sessions Before Long Break</Text>
                <TextInput
                  style={styles.input}
                  value={sessionsBeforeLongBreak}
                  onChangeText={setSessionsBeforeLongBreak}
                  keyboardType="number-pad"
                  testID="sessions-before-long-break-input"
                />
              </View>
              
              <Button
                title="Save Timer Settings"
                onPress={handleSaveSettings}
                style={styles.saveButton}
              />
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notifications</Text>
              
              <View style={styles.toggleItem}>
                <View style={styles.toggleInfo}>
                  <Bell size={20} color={colors.text} />
                  <Text style={styles.toggleLabel}>Enable Notifications</Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.background}
                />
              </View>
              
              <View style={styles.toggleItem}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Sound</Text>
                </View>
                <Switch
                  value={soundEnabled}
                  onValueChange={setSoundEnabled}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.background}
                />
              </View>
              
              <View style={styles.toggleItem}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Vibration</Text>
                </View>
                <Switch
                  value={vibrationEnabled}
                  onValueChange={setVibrationEnabled}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.background}
                />
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Data Management</Text>
              
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemContent}>
                  <Calendar size={20} color={colors.text} />
                  <Text style={styles.menuItemLabel}>Export to Calendar</Text>
                </View>
                <ChevronRight size={20} color={colors.textLight} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemContent}>
                  <Share2 size={20} color={colors.text} />
                  <Text style={styles.menuItemLabel}>Export Data</Text>
                </View>
                <ChevronRight size={20} color={colors.textLight} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.menuItem, styles.dangerItem]}
                onPress={confirmClearData}
              >
                <View style={styles.menuItemContent}>
                  <Trash2 size={20} color={colors.danger} />
                  <Text style={[styles.menuItemLabel, styles.dangerText]}>
                    Clear All Data
                  </Text>
                </View>
                <ChevronRight size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemContent}>
                  <HelpCircle size={20} color={colors.text} />
                  <Text style={styles.menuItemLabel}>Help & Support</Text>
                </View>
                <ChevronRight size={20} color={colors.textLight} />
              </TouchableOpacity>
              
              <View style={styles.versionContainer}>
                <Text style={styles.versionText}>Version 1.0.0</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Appearance</Text>

              <View style={styles.toggleItem}>
                <View style={styles.toggleInfo}>
                  <Moon size={20} color={colors.text} />
                  <Text style={styles.toggleLabel}>Dark Mode</Text>
                </View>
                <Switch
                  value={false}
                  onValueChange={() => { Alert.alert('Dark mode', 'Coming soon'); }}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.background}
                  testID="dark-mode-toggle"
                />
              </View>

              <View style={{ marginTop: 8 }}>
                <Text style={styles.versionText}>Customize the app appearance. System-wide theme support coming soon.</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Accent</Text>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <View style={[styles.accentSwatch, { backgroundColor: colors.primary }]} />
                <View style={[styles.accentSwatch, { backgroundColor: colors.accent }]} />
                <View style={[styles.accentSwatch, { backgroundColor: colors.warning }]} />
                <View style={[styles.accentSwatch, { backgroundColor: colors.success }]} />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Iconography</Text>
              <View style={styles.toggleItem}>
                <View style={styles.toggleInfo}>
                  <Sun size={20} color={colors.text} />
                  <Text style={styles.toggleLabel}>High-contrast Icons</Text>
                </View>
                <Switch
                  value={true}
                  onValueChange={() => {}}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.background}
                  testID="contrast-icons-toggle"
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
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
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: colors.cardBackground,
  },
  tabButtonText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: colors.text,
  },
  accentSwatch: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  section: {
    marginBottom: 24,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  saveButton: {
    marginTop: 8,
  },
  toggleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: colors.danger,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  versionText: {
    color: colors.textLight,
  },
});
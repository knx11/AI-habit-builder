// Update toggle handlers
const handleNotificationsToggle = (value: boolean) => {
  if (Platform.OS !== 'web') {
    Haptics.selectionAsync();
  }
  setNotificationsEnabled(value);
};

const handleSoundToggle = (value: boolean) => {
  if (Platform.OS !== 'web') {
    Haptics.selectionAsync();
  }
  setSoundEnabled(value);
};

const handleVibrationToggle = (value: boolean) => {
  if (Platform.OS !== 'web') {
    Haptics.selectionAsync();
  }
  setVibrationEnabled(value);
};

// Update in the render
<Switch
  value={notificationsEnabled}
  onValueChange={handleNotificationsToggle}
  trackColor={{ false: colors.border, true: colors.primary }}
  thumbColor={colors.background}
/>

<Switch
  value={soundEnabled}
  onValueChange={handleSoundToggle}
  trackColor={{ false: colors.border, true: colors.primary }}
  thumbColor={colors.background}
/>

<Switch
  value={vibrationEnabled}
  onValueChange={handleVibrationToggle}
  trackColor={{ false: colors.border, true: colors.primary }}
  thumbColor={colors.background}
/>
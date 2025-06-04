// Update onPress handler
const handlePress = () => {
  if (Platform.OS !== 'web' && !disabled && !loading) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
  onPress();
};

return (
  <TouchableOpacity
    style={[styles.button, getButtonStyle(), style]}
    onPress={handlePress}
    disabled={disabled || loading}
    activeOpacity={0.8}
    {...rest}
  >
    {/* Rest of the button content */}
  </TouchableOpacity>
);
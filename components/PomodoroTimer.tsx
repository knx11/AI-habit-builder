// Update handleHourScroll and handleMinuteScroll
const handleHourScroll = (event: any) => {
  const offsetY = event.nativeEvent.contentOffset.y;
  const index = Math.round(offsetY / ITEM_HEIGHT);
  setSelectedHours(index);
  
  if (Platform.OS !== 'web') {
    Haptics.selectionAsync(); // Light feedback for scrolling
  }
};

const handleMinuteScroll = (event: any) => {
  const offsetY = event.nativeEvent.contentOffset.y;
  const index = Math.round(offsetY / ITEM_HEIGHT);
  setSelectedMinutes(index);
  
  if (Platform.OS !== 'web') {
    Haptics.selectionAsync(); // Light feedback for scrolling
  }
};

// Update toggleTimer
const toggleTimer = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
  setIsRunning(!isRunning);
};

// Update resetTimer
const resetTimer = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }
  setIsRunning(false);
  setTimeLeft(getDuration());
  setProgress(0);
};

// Update handleTimerComplete
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
// Update the styles section at the bottom of the file:

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    marginBottom: 16,
  },
  timerStatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32, // Increased from 24
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
    marginBottom: 32, // Increased from 24
    marginTop: 24, // Increased from 12
    paddingVertical: 20, // Added padding
  },
  timerCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressCircle: {
    borderWidth: 10,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  progressArc: {
    position: 'absolute',
    borderWidth: 10,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
  },
  timerInner: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    paddingVertical: 20, // Added padding
  },
  timerText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12, // Added margin
  },
  sessionText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8, // Added margin
  },
  tapHint: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 8,
    fontStyle: 'italic',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 20, // Increased from 12
  },
  // ... rest of the styles remain the same
});
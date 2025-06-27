// Same file content as before, but updating the timerCircle style in the styles object:

// ... (keep all existing code, only change the styles object)

const styles = StyleSheet.create({
  // ... (keep other styles)
  timerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#FF0000', // Changed to red
  },
  // ... (keep other styles)
});
// Previous code remains the same until the modal section...

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 24,
    width: '85%',
    maxWidth: 400,
    padding: 24,
    alignItems: 'center',
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: -8,
    top: -8,
    padding: 8,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 160,
    marginBottom: 24,
  },
  pickerColumn: {
    width: 100,
    height: '100%',
    marginHorizontal: 12,
  },
  pickerLabel: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
    textAlign: 'center',
  },
  picker: {
    height: '100%',
    borderRadius: 12,
    backgroundColor: colors.cardBackground,
  },
  pickerContent: {
    paddingVertical: 60, // To allow space for items above/below
  },
  pickerPadding: {
    height: 60, // Matches paddingVertical
  },
  pickerItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  selectedPickerItem: {
    backgroundColor: 'rgba(21, 55, 46, 0.1)',
    borderRadius: 10,
  },
  pickerItemText: {
    fontSize: 18,
    color: colors.textLight,
    fontWeight: '400',
  },
  selectedPickerItemText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.primary,
  },
  selectedTime: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  applyButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: '100%',
    padding: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '600',
  },
});

// Inside the Modal component:
<Modal
  visible={showAdjustModal}
  transparent={true}
  animationType="fade"
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>Adjust Timer</Text>
        <TouchableOpacity 
          onPress={() => setShowAdjustModal(false)}
          style={styles.closeButton}
        >
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.pickerContainer}>
        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>Hours</Text>
          <ScrollView 
            style={styles.picker}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.pickerContent}
            snapToInterval={40}
            decelerationRate="fast"
          >
            <View style={styles.pickerPadding} />
            {Array.from({ length: 24 }, (_, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.pickerItem,
                  selectedHours === i && styles.selectedPickerItem,
                ]}
                onPress={() => {
                  setSelectedHours(i);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              >
                <Text style={[
                  styles.pickerItemText,
                  selectedHours === i && styles.selectedPickerItemText,
                  { opacity: Math.abs(selectedHours - i) <= 2 ? 1 - Math.abs(selectedHours - i) * 0.3 : 0.1 }
                ]}>
                  {i.toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.pickerPadding} />
          </ScrollView>
        </View>

        <View style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>Minutes</Text>
          <ScrollView 
            style={styles.picker}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.pickerContent}
            snapToInterval={40}
            decelerationRate="fast"
          >
            <View style={styles.pickerPadding} />
            {Array.from({ length: 60 }, (_, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.pickerItem,
                  selectedMinutes === i && styles.selectedPickerItem,
                ]}
                onPress={() => {
                  setSelectedMinutes(i);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              >
                <Text style={[
                  styles.pickerItemText,
                  selectedMinutes === i && styles.selectedPickerItemText,
                  { opacity: Math.abs(selectedMinutes - i) <= 2 ? 1 - Math.abs(selectedMinutes - i) * 0.3 : 0.1 }
                ]}>
                  {i.toString().padStart(2, '0')}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.pickerPadding} />
          </ScrollView>
        </View>
      </View>

      <Text style={styles.selectedTime}>
        {selectedHours === 0 
          ? `${selectedMinutes} MINUTES`
          : `${selectedHours}:${selectedMinutes.toString().padStart(2, '0')}`
        }
      </Text>

      <TouchableOpacity 
        style={styles.applyButton}
        onPress={handleAdjustTime}
        activeOpacity={0.8}
      >
        <Text style={styles.applyButtonText}>Apply</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
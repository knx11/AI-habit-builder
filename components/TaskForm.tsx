// Same file content but with these changes:
// 1. Add isGeneratingAI state
// 2. Add aiError state
// 3. Add AI breakdown button
// 4. Add handleGenerateAIBreakdown function
// 5. Add error display
// 6. Update styles

// Update the imports to include:
import { AlertTriangle, Zap } from 'lucide-react-native';
import { generateTaskBreakdown } from '@/services/aiService';

// Add new state variables after existing useState declarations:
const [isGeneratingAI, setIsGeneratingAI] = useState(false);
const [aiError, setAiError] = useState<string | null>(null);

// Add new function before handleSubmit:
const handleGenerateAIBreakdown = async () => {
  if (!title.trim() || !description.trim()) {
    setError('Please enter both title and description first');
    return;
  }

  setIsGeneratingAI(true);
  setAiError(null);
  setError('');

  try {
    const result = await generateTaskBreakdown(title, description);
    
    // Update estimated time
    setEstimatedMinutes(result.totalEstimatedMinutes);
    
    // Update priority if suggested
    if (result.suggestedPriority) {
      setPriority(result.suggestedPriority);
    }

    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.log('Haptics not available');
      }
    }

  } catch (error) {
    console.error('Error generating AI breakdown:', error);
    setAiError('Failed to generate breakdown. Please try again.');
    
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (error) {
        console.log('Haptics not available');
      }
    }
  } finally {
    setIsGeneratingAI(false);
  }
};

// Add AI button after description input:
<View style={styles.aiSection}>
  <TouchableOpacity
    style={[
      styles.aiButton,
      (!title.trim() || !description.trim()) && styles.aiButtonDisabled,
      isGeneratingAI && styles.aiButtonLoading
    ]}
    onPress={handleGenerateAIBreakdown}
    disabled={!title.trim() || !description.trim() || isGeneratingAI}
  >
    {isGeneratingAI ? (
      <ActivityIndicator color={colors.primary} size="small" />
    ) : (
      <>
        <Zap size={20} color={colors.primary} />
        <Text style={styles.aiButtonText}>AI Breakdown</Text>
      </>
    )}
  </TouchableOpacity>
  
  {aiError && (
    <View style={styles.errorContainer}>
      <AlertTriangle size={16} color={colors.danger} />
      <Text style={styles.errorText}>{aiError}</Text>
    </View>
  )}
</View>

// Add to styles:
aiSection: {
  marginTop: 8,
  marginBottom: 16,
},
aiButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 12,
  borderRadius: 8,
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.primary,
},
aiButtonDisabled: {
  opacity: 0.5,
  borderColor: colors.border,
},
aiButtonLoading: {
  borderColor: colors.border,
},
aiButtonText: {
  marginLeft: 8,
  color: colors.primary,
  fontSize: 16,
  fontWeight: '500',
},
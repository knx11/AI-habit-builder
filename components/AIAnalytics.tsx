import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Brain, RefreshCw, TrendingUp, Clock, Target } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useTaskStore } from '@/store/taskStore';
import AnalyticsCard from './AnalyticsCard';

interface UserAnalysis {
  productivityPattern: string;
  timeManagement: string;
  taskCompletion: string;
  recommendations: string[];
  strengths: string[];
  areasForImprovement: string[];
  productivityScore: number;
  focusScore: number;
  consistencyScore: number;
}

export default function AIAnalytics() {
  const { tasks, dailyStats } = useTaskStore();
  const [analysis, setAnalysis] = useState<UserAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare user data for analysis
      const completedTasks = tasks.filter(task => task.completed).length;
      const totalTasks = tasks.length;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      // Calculate category distribution
      const categoryStats = tasks.reduce((acc, task) => {
        const category = task.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Calculate priority distribution
      const priorityStats = tasks.reduce((acc, task) => {
        const priority = task.priority || 'medium';
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Calculate average task completion time
      const avgEstimatedTime = tasks.length > 0 
        ? tasks.reduce((sum, task) => sum + (task.estimatedMinutes || 0), 0) / tasks.length 
        : 0;
      
      // Get recent productivity data
      const recentStats = dailyStats.slice(-7); // Last 7 days
      const avgProductivityScore = recentStats.length > 0
        ? recentStats.reduce((sum, stat) => sum + stat.productivityScore, 0) / recentStats.length
        : 0;
      
      // Calculate overdue tasks
      const now = new Date();
      const overdueTasks = tasks.filter(task => 
        !task.completed && task.dueDate && new Date(task.dueDate) < now
      ).length;
      
      // Prepare prompt for AI analysis
      const userDataPrompt = `Analyze this user's productivity data and provide insights:

Task Statistics:
- Total tasks: ${totalTasks}
- Completed tasks: ${completedTasks}
- Completion rate: ${completionRate.toFixed(1)}%
- Overdue tasks: ${overdueTasks}
- Average estimated time per task: ${avgEstimatedTime.toFixed(1)} minutes

Category distribution: ${Object.entries(categoryStats).map(([cat, count]) => `${cat}: ${count}`).join(', ')}

Priority distribution: ${Object.entries(priorityStats).map(([pri, count]) => `${pri}: ${count}`).join(', ')}

Recent productivity scores (last 7 days): ${recentStats.map(s => s.productivityScore).join(', ')}
Average productivity score: ${avgProductivityScore.toFixed(1)}%

Please provide a comprehensive analysis in JSON format with these fields:
{
  "productivityPattern": "Brief description of user's productivity patterns",
  "timeManagement": "Assessment of time management skills",
  "taskCompletion": "Analysis of task completion behavior",
  "recommendations": ["3-4 specific actionable recommendations"],
  "strengths": ["2-3 identified strengths"],
  "areasForImprovement": ["2-3 areas that need improvement"],
  "productivityScore": 85,
  "focusScore": 78,
  "consistencyScore": 92
}

Provide scores out of 100 and keep descriptions concise but insightful.`;

      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an expert productivity analyst. Analyze user data and provide actionable insights in the requested JSON format. Be specific and helpful in your recommendations.'
            },
            {
              role: 'user',
              content: userDataPrompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get AI analysis: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.completion) {
        throw new Error('Invalid response from AI service');
      }

      // Extract JSON from the completion
      const jsonMatch = data.completion.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const analysisData = JSON.parse(jsonMatch[0]);
      
      // Validate the response structure
      if (!analysisData.productivityPattern || !analysisData.recommendations) {
        throw new Error('Invalid analysis structure');
      }

      setAnalysis(analysisData);
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      setError('Failed to generate analysis. Please try again.');
      
      // Provide fallback analysis
      const completedTasks = tasks.filter(task => task.completed).length;
      const totalTasks = tasks.length;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      setAnalysis({
        productivityPattern: totalTasks === 0 
          ? "No tasks created yet. Start by adding some tasks to track your productivity."
          : `You have a ${completionRate >= 70 ? 'strong' : completionRate >= 40 ? 'moderate' : 'developing'} task completion pattern with ${completionRate.toFixed(1)}% completion rate.`,
        timeManagement: "Based on your task data, focus on breaking down larger tasks into smaller, manageable subtasks.",
        taskCompletion: completionRate >= 70 
          ? "You're doing well with task completion. Keep up the momentum!"
          : "Consider using time-blocking techniques to improve task completion rates.",
        recommendations: [
          "Use the Pomodoro timer for better focus",
          "Break large tasks into smaller subtasks",
          "Set realistic deadlines for your tasks",
          "Review and prioritize tasks daily"
        ],
        strengths: [
          totalTasks > 0 ? "Active task creation" : "Ready to start organizing",
          "Using a productivity system"
        ],
        areasForImprovement: [
          completionRate < 70 ? "Task completion consistency" : "Task complexity management",
          "Time estimation accuracy"
        ],
        productivityScore: Math.max(20, Math.min(95, completionRate)),
        focusScore: Math.max(30, Math.min(90, completionRate * 0.8)),
        consistencyScore: Math.max(25, Math.min(85, completionRate * 0.9))
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-generate analysis on component mount if there's data
    if (tasks.length > 0) {
      generateAnalysis();
    }
  }, []);

  if (tasks.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Brain size={24} color={colors.primary} />
          <Text style={styles.title}>AI Productivity Analysis</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Add some tasks to get personalized AI insights about your productivity patterns!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Brain size={24} color={colors.primary} />
        <Text style={styles.title}>AI Productivity Analysis</Text>
        <TouchableOpacity 
          onPress={generateAnalysis} 
          style={styles.refreshButton}
          disabled={isLoading}
        >
          <RefreshCw 
            size={20} 
            color={colors.primary} 
            style={isLoading ? styles.spinning : undefined}
          />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={generateAnalysis} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <AnalyticsCard
            title="AI Analysis"
            value=""
            isLoading={true}
            fullWidth={true}
            icon={<Brain size={24} color={colors.primary} />}
          />
        </View>
      )}

      {analysis && !isLoading && (
        <View style={styles.analysisContainer}>
          {/* Scores */}
          <View style={styles.scoresContainer}>
            <AnalyticsCard
              title="Productivity Score"
              value={`${analysis.productivityScore}%`}
              icon={<TrendingUp size={20} color={colors.primary} />}
              color={colors.primary}
            />
            <AnalyticsCard
              title="Focus Score"
              value={`${analysis.focusScore}%`}
              icon={<Target size={20} color={colors.secondary} />}
              color={colors.secondary}
            />
            <AnalyticsCard
              title="Consistency Score"
              value={`${analysis.consistencyScore}%`}
              icon={<Clock size={20} color={colors.accent} />}
              color={colors.accent}
            />
          </View>

          {/* Analysis Sections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Productivity Pattern</Text>
            <Text style={styles.analysisText}>{analysis.productivityPattern}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏰ Time Management</Text>
            <Text style={styles.analysisText}>{analysis.timeManagement}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Task Completion</Text>
            <Text style={styles.analysisText}>{analysis.taskCompletion}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💪 Your Strengths</Text>
            {analysis.strengths.map((strength, index) => (
              <Text key={index} style={styles.listItem}>• {strength}</Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Areas for Improvement</Text>
            {analysis.areasForImprovement.map((area, index) => (
              <Text key={index} style={styles.listItem}>• {area}</Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚀 Recommendations</Text>
            {analysis.recommendations.map((rec, index) => (
              <Text key={index} style={styles.listItem}>• {rec}</Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  refreshButton: {
    padding: 8,
  },
  spinning: {
    transform: [{ rotate: '45deg' }],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    backgroundColor: colors.error + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    flex: 1,
  },
  retryButton: {
    backgroundColor: colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 12,
  },
  retryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    marginBottom: 16,
  },
  analysisContainer: {
    gap: 16,
  },
  scoresContainer: {
    gap: 8,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },
  listItem: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
    marginBottom: 4,
  },
});
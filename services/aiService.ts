import { Task, SubTask } from '@/types/task';

// Get API key from environment variables
const API_KEY = process.env.EXPO_PUBLIC_GEMENI || 'AIzaSyDvYxEd5bXSPaxQQTXIjfmyF9jxyysIbEg';

interface AITaskBreakdownResponse {
  subTasks: Array<{
    title: string;
    estimatedMinutes: number;
  }>;
  totalEstimatedMinutes: number;
}

export const generateTaskBreakdown = async (
  taskTitle: string,
  taskDescription: string
): Promise<AITaskBreakdownResponse> => {
  try {
    const prompt = `Break down this task into smaller subtasks:
Task: ${taskTitle}
Description: ${taskDescription}

Please provide a JSON response with:
1. A list of subtasks with titles and estimated time in minutes
2. A total estimated time for the entire task

Format your response as a valid JSON object with this structure:
{
  "subTasks": [
    { "title": "Subtask 1", "estimatedMinutes": 30 },
    { "title": "Subtask 2", "estimatedMinutes": 45 }
  ],
  "totalEstimatedMinutes": 75
}`;

    // Use Google's Gemini API directly with the provided API key
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response: ' + response.statusText);
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response - handle different formats
    let jsonResponse;
    try {
      // First try to parse the entire response as JSON
      jsonResponse = JSON.parse(textResponse);
    } catch (e) {
      // If that fails, try to extract JSON from markdown code blocks or regular text
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          jsonResponse = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          console.error('Failed to parse extracted JSON:', e2);
          throw new Error('Invalid JSON format in AI response');
        }
      } else {
        throw new Error('Could not find JSON in AI response');
      }
    }
    
    // Validate the response structure
    if (!jsonResponse.subTasks || !Array.isArray(jsonResponse.subTasks) || 
        typeof jsonResponse.totalEstimatedMinutes !== 'number') {
      throw new Error('AI response missing required fields');
    }
    
    return {
      subTasks: jsonResponse.subTasks,
      totalEstimatedMinutes: jsonResponse.totalEstimatedMinutes,
    };
  } catch (error) {
    console.error('Error generating task breakdown:', error);
    // Fallback to a simple breakdown if AI fails
    return {
      subTasks: [
        { title: `Plan ${taskTitle}`, estimatedMinutes: 15 },
        { title: `Execute ${taskTitle}`, estimatedMinutes: 30 },
        { title: `Review ${taskTitle}`, estimatedMinutes: 15 },
      ],
      totalEstimatedMinutes: 60,
    };
  }
};

export const getProductivityInsights = async (
  completedTasks: number,
  totalTasks: number,
  productivityScore: number,
  timeByCategory: Record<string, number>
): Promise<string> => {
  try {
    const categories = Object.entries(timeByCategory)
      .map(([category, minutes]) => `${category}: ${Math.round(minutes / 60)} hours`)
      .join(', ');

    const prompt = `Based on the following data, provide brief productivity insights and suggestions:
- Completed ${completedTasks} out of ${totalTasks} tasks
- Productivity score: ${productivityScore}/100
- Time spent by category: ${categories}

Keep your response under 150 words and focus on actionable advice.`;

    // Use Google's Gemini API directly
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating productivity insights:', error);
    return "Based on your recent activity, try to break larger tasks into smaller, more manageable pieces. Consider allocating specific time blocks for focused work and remember to take short breaks between sessions to maintain productivity.";
  }
};
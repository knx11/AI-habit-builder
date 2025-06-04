import { Task, SubTask } from '@/types/task';

// API key for AI services
const API_KEY = 'AIzaSyDvYxEd5bXSPaxQQTXIjfmyF9jxyysIbEg';

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

    // First try using the provided API key with Google's API
    try {
      const googleResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + API_KEY, {
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

      if (googleResponse.ok) {
        const data = await googleResponse.json();
        const textResponse = data.candidates[0].content.parts[0].text;
        
        // Extract JSON from the response
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedResponse = JSON.parse(jsonMatch[0]);
          return {
            subTasks: parsedResponse.subTasks,
            totalEstimatedMinutes: parsedResponse.totalEstimatedMinutes,
          };
        }
      }
      
      // If Google API fails or doesn't return proper JSON, fall back to toolkit
      throw new Error('Failed to parse Google API response');
    } catch (googleError) {
      console.log('Falling back to toolkit API:', googleError);
      
      // Fallback to toolkit API
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that breaks down tasks into smaller, actionable subtasks with time estimates.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const parsedResponse = JSON.parse(data.completion);
      
      return {
        subTasks: parsedResponse.subTasks,
        totalEstimatedMinutes: parsedResponse.totalEstimatedMinutes,
      };
    }
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

    // Try Google API first
    try {
      const googleResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + API_KEY, {
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

      if (googleResponse.ok) {
        const data = await googleResponse.json();
        return data.candidates[0].content.parts[0].text;
      }
      
      throw new Error('Failed to get Google API response');
    } catch (googleError) {
      console.log('Falling back to toolkit API:', googleError);
      
      // Fallback to toolkit
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a productivity coach providing brief, actionable insights.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      return data.completion;
    }
  } catch (error) {
    console.error('Error generating productivity insights:', error);
    return "Based on your recent activity, try to break larger tasks into smaller, more manageable pieces. Consider allocating specific time blocks for focused work and remember to take short breaks between sessions to maintain productivity.";
  }
};
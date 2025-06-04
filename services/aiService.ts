import { Task, SubTask } from '@/types/task';

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
    const API_KEY = process.env.EXPO_PUBLIC_GEMINI;
    
    if (!API_KEY) {
      console.error("No API key found for Gemini");
      throw new Error("API key is missing");
    }
    
    const prompt = `Break down this task into smaller subtasks:
Task: ${taskTitle}
Description: ${taskDescription || "No description provided"}

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

    console.log("Sending request to Gemini API with prompt:", prompt);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
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
      const errorText = await response.text();
      console.error('API response error:', response.status, errorText);
      throw new Error(`Failed to get AI response: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Received response from Gemini API:", JSON.stringify(data, null, 2));
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response structure from AI service');
    }
    
    const textResponse = data.candidates[0].content.parts[0].text;
    
    if (!textResponse) {
      console.error('Empty text response');
      throw new Error('Empty response from AI service');
    }
    
    // Extract JSON from the response
    let jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', textResponse);
      throw new Error('No JSON found in response');
    }

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error parsing JSON:', error, 'Raw match:', jsonMatch[0]);
      throw new Error('Failed to parse JSON response');
    }
    
    // Validate the response structure
    if (!jsonResponse.subTasks || !Array.isArray(jsonResponse.subTasks) || 
        typeof jsonResponse.totalEstimatedMinutes !== 'number') {
      console.error('AI response missing required fields:', jsonResponse);
      throw new Error('AI response missing required fields');
    }
    
    return {
      subTasks: jsonResponse.subTasks,
      totalEstimatedMinutes: jsonResponse.totalEstimatedMinutes,
    };
  } catch (error) {
    console.error('Error generating task breakdown:', error);
    throw error;
  }
};

export const getProductivityInsights = async (
  completedTasks: number,
  totalTasks: number,
  productivityScore: number,
  timeByCategory: Record<string, number>
): Promise<string> => {
  try {
    const API_KEY = process.env.EXPO_PUBLIC_GEMINI;
    
    if (!API_KEY) {
      return "Based on your recent activity, try to break larger tasks into smaller, more manageable pieces.";
    }
    
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const categoryBreakdown = Object.entries(timeByCategory)
      .map(([category, minutes]) => `${category}: ${minutes} minutes`)
      .join(", ");
      
    const prompt = `I'm looking for productivity insights based on my recent activity. Here's my data:
- Completed ${completedTasks} out of ${totalTasks} tasks (${completionRate.toFixed(1)}% completion rate)
- Productivity score: ${productivityScore}%
- Time spent by category: ${categoryBreakdown || "No category data available"}

Please provide a concise analysis (2-3 sentences) of my productivity and one actionable suggestion to improve it. Respond in plain text without any formatting or code blocks.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
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
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 256,
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI insights: ' + response.statusText);
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      return "Your productivity is on track. Consider setting specific time blocks for focused work to further improve your efficiency.";
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error getting productivity insights:', error);
    return "Your productivity is on track. Consider setting specific time blocks for focused work to further improve your efficiency.";
  }
};
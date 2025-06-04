import { Task, SubTask } from '@/types/task';

const API_KEY = process.env.EXPO_PUBLIC_GEMENI;

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
      throw new Error('Failed to get AI response: ' + response.statusText);
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    let jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    let jsonResponse = JSON.parse(jsonMatch[0]);
    
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
    throw error;
  }
};
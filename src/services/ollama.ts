import { StreamResponse } from "@/types/chat";

const OLLAMA_HOST = "http://localhost:11434";

export const fetchOllamaModels = async () => {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`);
    if (!response.ok) throw new Error('Failed to fetch models');
    const data = await response.json();
    return data.models.map((model: { name: string }) => ({
      id: model.name,
      name: model.name.charAt(0).toUpperCase() + model.name.slice(1),
    }));
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    throw error;
  }
};

export const streamChat = async (
  model: string,
  message: string,
  onChunk: (chunk: StreamResponse) => void
) => {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: message }],
        stream: true,
      }),
    });

    if (!response.ok) throw new Error('Failed to send message');
    
    const reader = response.body?.getReader();
    if (!reader) throw new Error('Failed to create stream reader');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n').filter(Boolean);
      
      for (const line of lines) {
        const data = JSON.parse(line) as StreamResponse;
        onChunk(data);
      }
    }
  } catch (error) {
    console.error('Error in chat stream:', error);
    throw error;
  }
};
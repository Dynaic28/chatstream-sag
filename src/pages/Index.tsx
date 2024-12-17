import { useState } from "react";
import { ModelSelect } from "@/components/ModelSelect";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { Message, ModelOption } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

const MODELS: ModelOption[] = [
  { id: "llama2", name: "Llama 2" },
  { id: "codellama", name: "Code Llama" },
  { id: "mistral", name: "Mistral" },
];

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const { toast } = useToast();

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `This is a simulated response from the ${selectedModel} model.`,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b p-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-xl font-bold">Ollama Chat</h1>
          <ModelSelect
            models={MODELS}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-4xl space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
      </main>

      <footer className="border-t p-4">
        <div className="mx-auto max-w-4xl">
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </div>
      </footer>
    </div>
  );
};

export default Index;
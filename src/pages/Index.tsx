import { useState, useEffect } from "react";
import { ModelSelect } from "@/components/ModelSelect";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { Message, ModelOption } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { fetchOllamaModels, streamChat } from "@/services/ollama";

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const loadModels = async () => {
      try {
        const availableModels = await fetchOllamaModels();
        setModels(availableModels);
        if (availableModels.length > 0) {
          setSelectedModel(availableModels[0].id);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch available models. Is Ollama running?",
          variant: "destructive",
        });
      }
    };

    loadModels();
  }, [toast]);

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
      let assistantContent = "";
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      await streamChat(selectedModel, content, (chunk) => {
        assistantContent += chunk.message.content;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, content: assistantContent }
              : msg
          )
        );
      });
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
            models={models}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4">
        <div className="mx-auto max-w-4xl space-y-4">
          {messages.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Start a conversation by sending a message below. Select your preferred model from the dropdown above.
              </AlertDescription>
            </Alert>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}
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
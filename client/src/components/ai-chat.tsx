import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { sendAIMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, User, Send, CheckCircle } from "lucide-react";
import type { ChatMessage, AIResponse } from "@/lib/types";

const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export function AIChat() {
  const [sessionId] = useState(generateSessionId);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant', 
      content: "Aloha! I'm the AI booking assistant for CapturedCCollective, where we blend professionalism with creativity to deliver cinematic, high-impact content. The double 'C' in our name stands for Content and Cinematic, with a strong emphasis on Creative storytelling. Whether you need real estate visuals, event coverage, branded content, or traditional photography, I can help you find the perfect package and check availability. What brings you here today?",
      timestamp: Date.now(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: ({ message, clientEmail }: { message: string; clientEmail?: string }) => 
      sendAIMessage(sessionId, message, clientEmail),
    onSuccess: (response: AIResponse) => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.message,
          timestamp: Date.now(),
        }
      ]);
    },
    onError: () => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I'm having trouble responding right now. Please try again or contact us directly.",
          timestamp: Date.now(),
        }
      ]);
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    sendMessageMutation.mutate({ message: inputMessage });
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const aiFeatures = [
    "Real-time availability checking",
    "Automatic quote generation", 
    "Location recommendations",
    "Weather and timing optimization",
  ];

  return (
    <Card className="w-full max-w-2xl h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="font-playfair text-2xl flex items-center">
          <Bot className="h-6 w-6 mr-2 text-bronze" />
          AI Booking Assistant
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 border rounded-lg p-4 mb-4 bg-muted/30">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="bg-bronze text-white rounded-full p-2 mr-3 flex-shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background shadow-sm border'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>

                {message.role === 'user' && (
                  <div className="bg-primary text-primary-foreground rounded-full p-2 ml-3 flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {sendMessageMutation.isPending && (
              <div className="flex items-start justify-start">
                <div className="bg-bronze text-white rounded-full p-2 mr-3">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-background shadow-sm border px-4 py-2 rounded-lg">
                  <p className="text-sm">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || sendMessageMutation.isPending}
            className="btn-bronze"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* AI Features */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-bold mb-3 flex items-center">
            <CheckCircle className="h-4 w-4 mr-1 text-bronze" />
            AI Features Available:
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {aiFeatures.map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs justify-start">
                <CheckCircle className="h-3 w-3 mr-1 text-bronze" />
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

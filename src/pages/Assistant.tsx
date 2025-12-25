import { useState, useRef, useEffect } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { assistantApi } from '@/services/api';
import type { AssistantResponse } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Send, User, Loader2, Zap, MessageCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  data?: AssistantResponse['data'];
  timestamp: Date;
}

const suggestions = [
  'Create Design Homepage',
  'View Tasks',
  'Move to In Progress',
  'Assign to John',
  'View Projects',
  'My Tasks',
];


export default function Assistant() {
  const { projects, fetchProjects } = useProjectStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hi! I'm your task management assistant. I can help you:\n\nCreate tasks\nAssign tasks to team members\nUpdate task status\nList tasks and projects\nDelete tasks\n\nWhat would you like to do?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (message?: string) => {
    const content = message || input;
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await assistantApi.processCommand({
        message: content.trim(),
        projectId: selectedProject || undefined,
      });

      const assistantResponse = response.data.data;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantResponse.response,
        data: assistantResponse.data,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)] flex-col">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-3"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 flex-1 min-h-0">
        <Card className="lg:col-span-3 flex flex-col overflow-hidden border-2 shadow-xl">
          <CardHeader className="border-b py-3 sm:py-4 bg-gradient-to-r from-card to-card/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                Task Assistant
              </CardTitle>
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem
                      key={project._id || project.id}
                      value={project._id || project.id}
                    >
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full p-3 sm:p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2 sm:gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <Avatar
                      className={`h-8 w-8 sm:h-10 sm:w-10 shrink-0 ring-2 ${
                        message.role === 'user'
                          ? 'ring-primary/20'
                          : 'ring-blue-500/20'
                      }`}
                    >
                      <AvatarFallback
                        className={
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground'
                            : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                        }
                      >
                        {message.role === 'user' ? (
                          <User className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-md transition-all duration-200 hover:shadow-lg ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground'
                          : 'bg-gradient-to-br from-muted to-muted/50 border-2 border-blue-500/10'
                      }`}
                    >
                      <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                      <span className="text-[10px] sm:text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 ring-2 ring-blue-500/20">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-2xl bg-gradient-to-br from-muted to-muted/50 px-4 py-3 border-2 border-blue-500/10">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        <span className="text-sm text-muted-foreground">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>

          <div className="border-t-2 p-3 sm:p-4 bg-gradient-to-r from-card to-card/50">
            <div className="flex gap-2">
              <Input
                placeholder="Type a command or ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="shrink-0"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col overflow-hidden border-2 shadow-xl">
          <CardHeader className="py-3 sm:py-4 border-b bg-gradient-to-r from-card to-card/50">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Zap className="h-4 w-4 text-yellow-500" />
              Quick Commands
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Click to try these commands
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-3 sm:p-4">
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 sm:py-3 text-xs sm:text-sm hover:bg-blue-500/10 hover:border-blue-500/30 transition-all duration-200 group"
                  onClick={() => handleSend(suggestion)}
                  disabled={isLoading}
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200">
                    {suggestion}
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

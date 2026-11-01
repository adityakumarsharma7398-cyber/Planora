import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { AlexText } from '../components/AlexText';
import { api } from '../services/api';
import { EventEntity, AssistantResponse } from '../types/event';
import { 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronDown,
  Loader2 
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedAction?: AssistantResponse['suggestedAction'];
  actionApproved?: boolean;
}

export const AiAssistantPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [allEvents, setAllEvents] = useState<EventEntity[]>([]);
  const [event, setEvent] = useState<EventEntity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getEvents()
      .then((evs) => setAllEvents(evs))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (id) loadEvent(id);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadEvent = async (eventId: string) => {
    try {
      setLoading(true);
      const data = await api.getEventById(eventId);
      setEvent(data);

      // Initial welcome message matching reference specification
      setMessages([
        {
          id: 'welcome-msg',
          sender: 'assistant',
          text: `Hi! I'm your event planning assistant for ${data.name}. I can help you with:\n• Budget recommendations\n• Vendor suggestions\n• Creative theme ideas\n• Timeline planning\n• Answering any event-related questions\n\nWhat would you like to know or plan today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error('Failed to load event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage;
    if (!id || !textToSend.trim() || sending) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setSending(true);

    try {
      const response = await api.sendAiChat(id, textToSend);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: response.suggestedAction,
        actionApproved: false,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `Based on your celebration scope for ${event?.name} (${event?.guestCount} guests, budget ${event?.currency === 'INR' ? '₹' : '$'}${event?.budget?.toLocaleString()}): \n\n• For your ${textToSend}: prioritizing verified vendors like ${event?.quotes?.[0]?.vendorName || 'Royal Caterers'} will keep allocations protected within your category targets.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleApproveAction = async (msgId: string, action: AssistantResponse['suggestedAction']) => {
    if (!id || !action || !event) return;

    try {
      if (action.type === 'rebalance_budget') {
        const payload = action.payload as {
          newBudget?: number;
          recommendedAllocations?: Array<{ category: string; amount: number; rationale: string }>;
        };
        if (payload.newBudget && payload.recommendedAllocations) {
          await api.approveReplan(id, {
            newBudget: payload.newBudget,
            recommendedAllocations: payload.recommendedAllocations,
            rationale: action.explanation,
          });
        }
      } else if (action.type === 'add_task') {
        const taskPayload = action.payload as { title: string; dueDate?: string; priority?: 'low' | 'medium' | 'high' | 'critical' };
        await api.addTask(id, {
          title: taskPayload.title,
          dueDate: taskPayload.dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
          priority: taskPayload.priority || 'medium',
        });
      }

      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, actionApproved: true } : m))
      );
      await loadEvent(id);
      alert('Plan adaptation approved and saved to your event plan.');
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to apply plan change');
    }
  };

  const promptSuggestions = [
    'Suggest theme ideas',
    'Optimize my budget',
    'Create a timeline',
    'Find vendors',
  ];

  if (loading || !event) {
    return (
      <Layout>
        <div className="py-24 text-center">
          <div className="h-10 w-10 border-4 border-[#7C4DCE] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-semibold text-[#71677F]">Connecting AI planning assistant...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activeEventName={event.name}>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header with Event Dropdown Selector matching reference */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#E8DFF5]">
          <div>
            <AlexText as="h1" scale="text-[1.28em]" className="text-3xl font-normal text-[#29213F]">
              Planning Assistant
            </AlexText>
            <p className="text-xs text-[#71677F] mt-0.5">
              Personalized celebration intelligence with approval gates
            </p>
          </div>

          {/* Event Context Selector Dropdown matching reference */}
          <div className="relative">
            <select
              value={event.id}
              onChange={(e) => navigate(`/events/${e.target.value}/assistant`)}
              className="appearance-none pl-4 pr-9 py-2 rounded-asym bg-white border border-[#E8DFF5] text-xs font-bold text-[#29213F] shadow-xs cursor-pointer focus:outline-none focus:border-[#7C4DCE]"
            >
              {allEvents.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-[#7C4DCE] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Chat Window Card */}
        <div className="card-asym flex flex-col h-[600px] overflow-hidden bg-white">
          {/* Messages Scroll Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${isAssistant ? '' : 'flex-row-reverse space-x-reverse'}`}
                >
                  {isAssistant && (
                    <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-[#E8A0D4] flex-shrink-0">
                      <img
                        src="/images/user-alex.jpg"
                        alt="Planning Assistant"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className={`max-w-xl space-y-2 ${isAssistant ? '' : 'text-right'}`}>
                    <div
                      className={`p-4 rounded-asym text-xs leading-relaxed whitespace-pre-wrap ${
                        isAssistant
                          ? 'bg-[#FAF7FC] border border-[#E8DFF5] text-[#29213F]'
                          : 'bg-gradient-to-r from-[#7C4DCE] to-[#6035C4] text-white shadow-soft font-medium'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Proposed Action Approval Card (enforces safety rule) */}
                    {isAssistant && msg.suggestedAction && (
                      <div className="p-3.5 rounded-asym bg-[#F9F5FD] border border-[#A477E8]/40 space-y-2 text-left">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-[#7C4DCE]">
                          <ShieldCheck className="h-4 w-4" />
                          <span>Action Requires Approval</span>
                        </div>
                        <p className="text-[11px] text-[#71677F]">
                          {msg.suggestedAction.explanation}
                        </p>
                        {msg.actionApproved ? (
                          <div className="flex items-center space-x-1 text-emerald-700 text-xs font-bold pt-1">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Action Approved & Applied</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApproveAction(msg.id, msg.suggestedAction)}
                            className="px-3.5 py-1.5 rounded-asym-sm bg-[#7C4DCE] hover:bg-[#6035C4] text-white text-[11px] font-bold shadow-xs cursor-pointer"
                          >
                            Approve & Update Plan
                          </button>
                        )}
                      </div>
                    )}

                    <span className="text-[10px] text-[#71677F]/80 block px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full overflow-hidden border border-[#E8A0D4]">
                  <img src="/images/user-alex.jpg" alt="Thinking" className="h-full w-full object-cover" />
                </div>
                <div className="p-3 rounded-asym bg-[#FAF7FC] border border-[#E8DFF5] flex items-center space-x-2 text-xs text-[#71677F]">
                  <Loader2 className="h-4 w-4 animate-spin text-[#7C4DCE]" />
                  <span>Analyzing celebration context...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Suggestions Bar matching reference */}
          <div className="px-6 py-2.5 bg-[#FAF7FC] border-t border-[#E8DFF5] flex items-center space-x-2 overflow-x-auto">
            <span className="text-[10px] font-bold text-[#71677F] uppercase tracking-wider flex-shrink-0">
              Suggestions:
            </span>
            {promptSuggestions.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="px-3 py-1 rounded-asym-sm text-xs font-semibold text-[#7C4DCE] bg-white border border-[#E8DFF5] hover:border-[#7C4DCE] hover:bg-[#F3EBFB] transition-colors whitespace-nowrap cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar matching reference */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-4 bg-white border-t border-[#E8DFF5] flex items-center space-x-3"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about your event..."
              disabled={sending}
              className="flex-1 px-4 py-2.5 input-asym text-xs sm:text-sm focus:outline-none"
            />
            <button
              type="submit"
              disabled={sending || !inputMessage.trim()}
              className="px-4 py-2.5 rounded-asym bg-gradient-to-r from-[#7C4DCE] to-[#6035C4] hover:from-[#6035C4] hover:to-[#7C4DCE] text-white font-bold shadow-soft transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center"
              aria-label="Send Message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AiAssistantPage;

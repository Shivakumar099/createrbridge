import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import {
  MessageSquare,
  Send,
  Paperclip,
  CheckCheck,
  Search,
  Sparkles,
  Building2,
  Phone,
  Video,
  Info
} from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { conversations, messages, sendMessage, showToast } = useData();
  const { user, role } = useAuth();

  const [activeConvId, setActiveConvId] = useState(conversations[0]?.id || 'conv_boat_tanya');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];
  const currentMessages = messages[activeConvId] || [];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    await sendMessage(
      activeConvId,
      inputText,
      activeConv?.campaignId,
      activeConv?.campaignTitle
    );
    setInputText('');
  };

  const handleAttachFile = () => {
    showToast('File Attached', 'Storyboard preview image attached to message draft.', 'info');
    setInputText(prev => prev ? `${prev} [Attachment: storyboard_v1.pdf]` : '[Attachment: storyboard_v1.pdf]');
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8.5rem)] flex flex-col bg-surface-card rounded-card border border-surface-border shadow-subtle overflow-hidden animate-fade-in">
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Conversation Roster */}
          <div className="w-80 border-r border-surface-border flex flex-col bg-surface-bg/40">
            {/* Search in conversations */}
            <div className="p-4 border-b border-surface-border">
              <div className="relative">
                <Search className="w-4 h-4 text-content-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-surface-border bg-white focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto divide-y divide-surface-border/50">
              {conversations.map(conv => {
                const isSelected = conv.id === activeConvId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`p-4 cursor-pointer transition-colors flex items-start gap-3 ${
                      isSelected ? 'bg-brand-light/50 border-r-2 border-brand-primary' : 'hover:bg-white'
                    }`}
                  >
                    <img
                      src={conv.participantAvatar}
                      alt={conv.participantName}
                      className="w-10 h-10 rounded-xl object-cover border border-surface-border flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-content-primary truncate">
                          {conv.participantName}
                        </h4>
                        <span className="text-[10px] text-content-muted">{conv.lastMessageTime}</span>
                      </div>
                      {conv.campaignTitle && (
                        <span className="text-[10px] text-brand-primary font-semibold truncate block">
                          {conv.campaignTitle}
                        </span>
                      )}
                      <p className="text-xs text-content-secondary truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Chat Thread Window */}
          <div className="flex-1 flex flex-col bg-white">
            {/* Chat Header */}
            {activeConv && (
              <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-bg/30">
                <div className="flex items-center gap-3">
                  <img
                    src={activeConv.participantAvatar}
                    alt={activeConv.participantName}
                    className="w-10 h-10 rounded-xl object-cover border border-surface-border"
                  />
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-content-primary flex items-center gap-1.5">
                      {activeConv.participantName}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-light text-brand-primary capitalize">
                        {activeConv.participantRole}
                      </span>
                    </h3>
                    <p className="text-[11px] text-content-muted">
                      Campaign: {activeConv.campaignTitle || 'Brand Collaboration'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => showToast('Simulating Voice Call', 'Direct voice briefing initiating...', 'info')}
                    className="p-2 text-content-secondary hover:text-brand-primary hover:bg-surface-bg rounded-xl"
                    title="Audio Briefing Call"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => showToast('Video Call Room', 'Opening secure Google Meet / CreatorBridge room...', 'info')}
                    className="p-2 text-content-secondary hover:text-brand-primary hover:bg-surface-bg rounded-xl"
                    title="Video Call"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {currentMessages.map(msg => {
                const isMe = (user?.id && msg.senderId === user.id) || (role === 'creator' && msg.senderRole === 'creator') || (role === 'brand' && msg.senderRole === 'brand');

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-content-muted px-1 mb-0.5 font-medium">
                      {msg.senderName} ({msg.senderRole})
                    </span>
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-brand-primary text-white rounded-tr-none'
                          : 'bg-surface-bg text-content-primary border border-surface-border rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-content-muted mt-1 px-1 flex items-center gap-1">
                      {msg.timestamp}
                      {isMe && <CheckCheck className="w-3 h-3 text-brand-primary" />}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSend} className="p-3.5 border-t border-surface-border bg-surface-bg/30 flex items-center gap-2">
              <button
                type="button"
                onClick={handleAttachFile}
                className="p-2 text-content-muted hover:text-brand-primary rounded-xl hover:bg-surface-bg transition-colors"
                title="Attach Document / Storyboard"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                placeholder="Type your message, shoot update, or script feedback..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-surface-border bg-white text-xs focus:outline-none focus:border-brand-primary"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-brand-primary text-white hover:bg-brand-secondary transition-all disabled:opacity-50 shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

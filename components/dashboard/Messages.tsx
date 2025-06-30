'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Search, 
  Filter, 
  Clock,
  CheckCircle,
  AlertCircle,
  Edit3,
  Trash2,
  Save,
  X,
  Loader2,
  Plus,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DatabaseService } from '@/lib/supabase/database';
import { toast } from 'sonner';

interface MessagesProps {
  user: any;
}

interface ExtendedMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  sent_at: string;
  read_by: string[];
  urgent: boolean;
  attachments?: string[];
  sender?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    role?: { name: string };
  };
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

interface ExtendedConversation {
  id: string;
  patient_id: string;
  subject?: string;
  last_message_at: string;
  messageCount: number;
  latestMessage: string;
  latestMessageTime: string;
  hasUnreadMessages: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  messages: ExtendedMessage[];
}

export default function Messages({ user }: MessagesProps) {
  const { user: authUser } = useAuth();
  const [conversations, setConversations] = useState<ExtendedConversation[]>([]);
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);
  const [newConversationSubject, setNewConversationSubject] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations on component mount
  useEffect(() => {
    if (authUser?.id) {
      loadConversations();
    }
  }, [authUser?.id]);

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      markConversationAsRead(selectedConversation);
    }
  }, [selectedConversation]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!authUser?.id || !selectedConversation) return;

    const messageSubscription = DatabaseService.subscribeToMessages(
      selectedConversation,
      (payload) => {
        if (payload.eventType === 'INSERT') {
          loadMessages(selectedConversation);
        } else if (payload.eventType === 'UPDATE') {
          setMessages(prev => prev.map(msg => 
            msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
          ));
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
        }
      }
    );

    const conversationSubscription = DatabaseService.subscribeToConversations(
      authUser.id,
      () => {
        loadConversations();
      }
    );

    return () => {
      messageSubscription.unsubscribe();
      conversationSubscription.unsubscribe();
    };
  }, [authUser?.id, selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await DatabaseService.getConversations(authUser?.id);
      setConversations(data);
      
      // Auto-select first conversation if none selected
      if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0].id);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const data = await DatabaseService.getMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const markConversationAsRead = async (conversationId: string) => {
    if (!authUser?.id) return;
    
    try {
      await DatabaseService.markConversationAsRead(conversationId, authUser.id);
      // Refresh conversations to update unread counts
      loadConversations();
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !authUser?.id) return;

    setSendingMessage(true);
    try {
      await DatabaseService.createMessage({
        conversation_id: selectedConversation,
        sender_id: authUser.id,
        content: newMessage.trim(),
        urgent: false
      });

      setNewMessage('');
      toast.success('Message sent successfully');
      
      // Refresh conversations to update last message info
      loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editingContent.trim()) return;

    try {
      await DatabaseService.updateMessage(messageId, {
        content: editingContent.trim()
      });

      setEditingMessageId(null);
      setEditingContent('');
      toast.success('Message updated successfully');
      
      // Refresh messages
      if (selectedConversation) {
        loadMessages(selectedConversation);
      }
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Failed to update message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await DatabaseService.deleteMessage(messageId);
      setDeletingMessageId(null);
      toast.success('Message deleted successfully');
      
      // Refresh messages
      if (selectedConversation) {
        loadMessages(selectedConversation);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleCreateConversation = async () => {
    if (!newConversationSubject.trim() || !authUser?.id) return;

    try {
      const conversation = await DatabaseService.createConversation({
        patient_id: authUser.id,
        subject: newConversationSubject.trim()
      });

      setNewConversationSubject('');
      setShowNewConversationDialog(false);
      setSelectedConversation(conversation.id);
      toast.success('New conversation created');
      
      // Refresh conversations
      loadConversations();
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
    }
  };

  const startEditing = (message: ExtendedMessage) => {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.latestMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedChat = conversations.find(c => c.id === selectedConversation);

  if (loading) {
    return (
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
          <p className="text-gray-600">Secure communication with your healthcare team</p>
        </div>
        <Button 
          onClick={() => setShowNewConversationDialog(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Conversation
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="surgery-card lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Conversations</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto">
            <div className="space-y-1">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No conversations found</p>
                  <Button 
                    onClick={() => setShowNewConversationDialog(true)}
                    className="mt-4 bg-primary hover:bg-primary/90"
                    size="sm"
                  >
                    Start a conversation
                  </Button>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`
                      w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors
                      ${selectedConversation === conversation.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}
                    `}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          HC
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">
                            {conversation.subject || 'Healthcare Team'}
                          </h3>
                          <div className="flex items-center space-x-1">
                            {conversation.hasUnreadMessages && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Healthcare Team</p>
                        <p className="text-sm text-gray-500 truncate">{conversation.latestMessage}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimestamp(conversation.latestMessageTime)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="surgery-card lg:col-span-2 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      HC
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedChat.subject || 'Healthcare Team'}
                    </h3>
                    <p className="text-sm text-gray-600">Healthcare Team</p>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation below</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === authUser?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`
                          max-w-[70%] rounded-lg p-3 space-y-1 group relative
                          ${message.sender_id === authUser?.id 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-100 text-gray-900'
                          }
                        `}
                      >
                        {editingMessageId === message.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="min-h-[60px] bg-white text-gray-900"
                              autoFocus
                            />
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelEditing}
                                className="h-7 px-2"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleEditMessage(message.id)}
                                className="h-7 px-2 bg-green-600 hover:bg-green-700"
                              >
                                <Save className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-between text-xs opacity-75">
                              <span>{formatTimestamp(message.sent_at)}</span>
                              {message.sender_id === authUser?.id && (
                                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => startEditing(message)}
                                    className="p-1 hover:bg-white/20 rounded"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => setDeletingMessageId(message.id)}
                                    className="p-1 hover:bg-white/20 rounded"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                              {message.sender_id === authUser?.id && (
                                <CheckCircle className="w-3 h-3 ml-2" />
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-end space-x-3">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-[40px] max-h-[120px] resize-none"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {sendingMessage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a conversation to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* New Conversation Dialog */}
      <Dialog open={showNewConversationDialog} onOpenChange={setShowNewConversationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
            <DialogDescription>
              Create a new conversation with your healthcare team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter conversation subject..."
                value={newConversationSubject}
                onChange={(e) => setNewConversationSubject(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowNewConversationDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateConversation}
                disabled={!newConversationSubject.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                Create Conversation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingMessageId} onOpenChange={() => setDeletingMessageId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setDeletingMessageId(null)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => deletingMessageId && handleDeleteMessage(deletingMessageId)}
            >
              Delete Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
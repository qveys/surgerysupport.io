'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Plus,
  ArrowLeft,
  Clock,
  CheckCircle,
  User,
  Stethoscope,
  Shield,
  Briefcase,
  Heart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  online: boolean;
  lastSeen?: string;
}

interface Message {
  id: string;
  contactId: string;
  content: string;
  timestamp: string;
  sent: boolean; // true if sent by current user, false if received
  read: boolean;
}

interface SimpleMessagesProps {
  user: any;
}

export default function SimpleMessages({ user }: SimpleMessagesProps) {
  const { user: authUser } = useAuth();
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock contacts - in real app, these would come from your database
  const [contacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      role: 'Surgeon',
      online: true,
      lastSeen: 'Online now'
    },
    {
      id: '2',
      name: 'Emily Chen',
      role: 'Recovery Coordinator',
      online: true,
      lastSeen: 'Online now'
    },
    {
      id: '3',
      name: 'Nurse Maria',
      role: 'Nurse',
      online: false,
      lastSeen: '2 hours ago'
    },
    {
      id: '4',
      name: 'Dr. Michael Brown',
      role: 'Anesthesiologist',
      online: false,
      lastSeen: 'Yesterday'
    },
    {
      id: '5',
      name: 'Lisa Thompson',
      role: 'Clinic Administrator',
      online: true,
      lastSeen: 'Online now'
    }
  ]);

  // Mock messages - in real app, these would come from your database
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      contactId: '1',
      content: 'Hi! How are you feeling today? Any pain or discomfort?',
      timestamp: '2024-01-25T10:30:00Z',
      sent: false,
      read: true
    },
    {
      id: '2',
      contactId: '1',
      content: 'I\'m feeling much better, thank you! The pain has reduced significantly.',
      timestamp: '2024-01-25T10:35:00Z',
      sent: true,
      read: true
    },
    {
      id: '3',
      contactId: '1',
      content: 'That\'s great to hear! Remember to take your medications as prescribed and get plenty of rest.',
      timestamp: '2024-01-25T10:40:00Z',
      sent: false,
      read: true
    },
    {
      id: '4',
      contactId: '2',
      content: 'Your follow-up appointment is scheduled for next Tuesday at 2 PM. Please arrive 15 minutes early.',
      timestamp: '2024-01-25T09:15:00Z',
      sent: false,
      read: true
    },
    {
      id: '5',
      contactId: '2',
      content: 'Perfect, I\'ll be there. Should I bring anything specific?',
      timestamp: '2024-01-25T09:20:00Z',
      sent: true,
      read: true
    },
    {
      id: '6',
      contactId: '3',
      content: 'Don\'t forget to take your evening medication. How are you feeling?',
      timestamp: '2024-01-24T20:00:00Z',
      sent: false,
      read: false
    }
  ]);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedContactData = contacts.find(c => c.id === selectedContact);
  const contactMessages = messages
    .filter(m => m.contactId === selectedContact)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const getContactIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'surgeon':
      case 'doctor':
      case 'anesthesiologist':
        return <Stethoscope className="w-4 h-4" />;
      case 'nurse':
        return <Heart className="w-4 h-4" />;
      case 'recovery coordinator':
        return <User className="w-4 h-4" />;
      case 'clinic administrator':
        return <Shield className="w-4 h-4" />;
      default:
        return <Briefcase className="w-4 h-4" />;
    }
  };

  const getContactInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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

  const getLastMessage = (contactId: string) => {
    const contactMsgs = messages.filter(m => m.contactId === contactId);
    if (contactMsgs.length === 0) return null;
    
    const lastMsg = contactMsgs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
    
    return lastMsg;
  };

  const getUnreadCount = (contactId: string) => {
    return messages.filter(m => m.contactId === contactId && !m.read && !m.sent).length;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    setSendingMessage(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMsg: Message = {
        id: Date.now().toString(),
        contactId: selectedContact,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        sent: true,
        read: true
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      toast.success('Message sent!');
      
      // Auto-scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleContactSelect = (contactId: string) => {
    setSelectedContact(contactId);
    
    // Mark messages as read
    setMessages(prev => prev.map(msg => 
      msg.contactId === contactId && !msg.sent 
        ? { ...msg, read: true }
        : msg
    ));
  };

  const handleNewMessage = (contactId: string) => {
    setSelectedContact(contactId);
    setShowNewMessageDialog(false);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [contactMessages]);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
          <p className="text-gray-600">Send messages to your healthcare team</p>
        </div>
        <Button 
          onClick={() => setShowNewMessageDialog(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Message
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Contacts List */}
        <Card className="surgery-card lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <span>Contacts</span>
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-y-auto">
            <div className="space-y-1">
              {filteredContacts.map((contact) => {
                const lastMessage = getLastMessage(contact.id);
                const unreadCount = getUnreadCount(contact.id);
                
                return (
                  <button
                    key={contact.id}
                    onClick={() => handleContactSelect(contact.id)}
                    className={`
                      w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors
                      ${selectedContact === contact.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}
                    `}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getContactInitials(contact.name)}
                          </AvatarFallback>
                        </Avatar>
                        {contact.online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">
                            {contact.name}
                          </h3>
                          <div className="flex items-center space-x-1">
                            {unreadCount > 0 && (
                              <Badge className="bg-primary text-white text-xs px-2 py-1">
                                {unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 mb-1">
                          {getContactIcon(contact.role)}
                          <span className="text-sm text-gray-600">{contact.role}</span>
                        </div>
                        {lastMessage ? (
                          <>
                            <p className="text-sm text-gray-500 truncate">
                              {lastMessage.sent ? 'You: ' : ''}{lastMessage.content}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatTimestamp(lastMessage.timestamp)}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-400">No messages yet</p>
                        )}
                        <div className="flex items-center space-x-1 mt-1">
                          <div className={`w-2 h-2 rounded-full ${contact.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span className="text-xs text-gray-500">{contact.lastSeen}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="surgery-card lg:col-span-2 flex flex-col">
          {selectedContactData ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setSelectedContact(null)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getContactInitials(selectedContactData.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedContactData.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {getContactIcon(selectedContactData.role)}
                      <span className="text-sm text-gray-600">{selectedContactData.role}</span>
                      <span className="text-xs text-gray-500">• {selectedContactData.lastSeen}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {contactMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation below</p>
                  </div>
                ) : (
                  contactMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`
                          max-w-[70%] rounded-lg p-3 space-y-1
                          ${message.sent 
                            ? 'bg-primary text-white' 
                            : 'bg-gray-100 text-gray-900'
                          }
                        `}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between text-xs opacity-75">
                          <span>{formatTimestamp(message.timestamp)}</span>
                          {message.sent && (
                            <CheckCircle className="w-3 h-3 ml-2" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-end space-x-3">
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
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
                <p>Select a contact to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* New Message Dialog */}
      <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Message</DialogTitle>
            <DialogDescription>
              Select a contact to send a message to
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleNewMessage(contact.id)}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getContactInitials(contact.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <h3 className="font-medium text-gray-900">{contact.name}</h3>
                    <div className="flex items-center space-x-1">
                      {getContactIcon(contact.role)}
                      <span className="text-sm text-gray-600">{contact.role}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${contact.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-xs text-gray-500">{contact.online ? 'Online' : 'Offline'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { supabase } from './client';
import type { Database } from './types';

// Type aliases for easier use
export type Appointment = Database['public']['Tables']['appointments']['Row'];
export type ChecklistItem = Database['public']['Tables']['checklist_items']['Row'];
export type Document = Database['public']['Tables']['documents']['Row'];
export type Medication = Database['public']['Tables']['medications']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];

export class DatabaseService {
  // Appointments
  static async getAppointments(userId?: string) {
    let query = supabase
      .from('appointments')
      .select('*')
      .is('deleted_at', null)
      .order('date', { ascending: true });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async createAppointment(appointment: Database['public']['Tables']['appointments']['Insert']) {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateAppointment(id: string, updates: Database['public']['Tables']['appointments']['Update']) {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteAppointment(id: string) {
    const { error } = await supabase
      .from('appointments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  // Checklist Items
  static async getChecklistItems(userId?: string) {
    let query = supabase
      .from('checklist_items')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async createChecklistItem(item: Database['public']['Tables']['checklist_items']['Insert']) {
    const { data, error } = await supabase
      .from('checklist_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateChecklistItem(id: string, updates: Database['public']['Tables']['checklist_items']['Update']) {
    const { data, error } = await supabase
      .from('checklist_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteChecklistItem(id: string) {
    const { error } = await supabase
      .from('checklist_items')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  // Documents
  static async getDocuments(userId?: string) {
    let query = supabase
      .from('documents')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async createDocument(document: Database['public']['Tables']['documents']['Insert']) {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        ...document,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateDocument(id: string, updates: Database['public']['Tables']['documents']['Update']) {
    const { data, error } = await supabase
      .from('documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteDocument(id: string) {
    const { error } = await supabase
      .from('documents')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  // Medications
  static async getMedications(userId?: string) {
    let query = supabase
      .from('medications')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async createMedication(medication: Database['public']['Tables']['medications']['Insert']) {
    const { data, error } = await supabase
      .from('medications')
      .insert(medication)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateMedication(id: string, updates: Database['public']['Tables']['medications']['Update']) {
    const { data, error } = await supabase
      .from('medications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteMedication(id: string) {
    const { error } = await supabase
      .from('medications')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  // Conversations and Messages
  static async getConversations(userId?: string) {
    let query = supabase
      .from('conversations')
      .select(`
        *,
        messages:messages!inner(
          id,
          content,
          sent_at,
          sender_id,
          urgent
        )
      `)
      .is('deleted_at', null)
      .order('last_message_at', { ascending: false });

    if (userId) {
      query = query.eq('patient_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Transform the data to include message counts and latest message info
    return data.map(conversation => {
      const messages = conversation.messages || [];
      const latestMessage = messages.length > 0 ? messages[messages.length - 1] : null;
      
      return {
        ...conversation,
        messageCount: messages.length,
        latestMessage: latestMessage?.content || 'No messages yet',
        latestMessageTime: latestMessage?.sent_at || conversation.created_at,
        hasUnreadMessages: messages.some(msg => 
          msg.sender_id !== userId && 
          !(msg as any).read_by?.includes(userId)
        )
      };
    });
  }

  static async getMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:user_profiles!sender_id(
          id,
          full_name,
          avatar_url,
          role:roles(name)
        )
      `)
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .order('sent_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async createMessage(message: Database['public']['Tables']['messages']['Insert']) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        ...message,
        sent_at: new Date().toISOString()
      })
      .select(`
        *,
        sender:user_profiles!sender_id(
          id,
          full_name,
          avatar_url,
          role:roles(name)
        )
      `)
      .single();

    if (error) throw error;

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ 
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', message.conversation_id);

    return data;
  }

  static async updateMessage(messageId: string, updates: { content?: string; urgent?: boolean }) {
    const { data, error } = await supabase
      .from('messages')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .select(`
        *,
        sender:user_profiles!sender_id(
          id,
          full_name,
          avatar_url,
          role:roles(name)
        )
      `)
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteMessage(messageId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ 
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId);

    if (error) throw error;
  }

  static async markMessageAsRead(messageId: string, userId: string) {
    // Get current read_by array
    const { data: message } = await supabase
      .from('messages')
      .select('read_by')
      .eq('id', messageId)
      .single();

    if (!message) return;

    const readBy = (message.read_by as string[]) || [];
    if (!readBy.includes(userId)) {
      readBy.push(userId);
      
      const { error } = await supabase
        .from('messages')
        .update({ 
          read_by: readBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;
    }
  }

  static async markConversationAsRead(conversationId: string, userId: string) {
    // Get all unread messages in the conversation
    const { data: messages } = await supabase
      .from('messages')
      .select('id, read_by')
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .is('deleted_at', null);

    if (!messages) return;

    // Mark each unread message as read
    const updates = messages
      .filter(msg => !(msg.read_by as string[])?.includes(userId))
      .map(msg => {
        const readBy = (msg.read_by as string[]) || [];
        readBy.push(userId);
        return {
          id: msg.id,
          read_by: readBy,
          updated_at: new Date().toISOString()
        };
      });

    if (updates.length > 0) {
      for (const update of updates) {
        await supabase
          .from('messages')
          .update({ 
            read_by: update.read_by,
            updated_at: update.updated_at
          })
          .eq('id', update.id);
      }
    }
  }

  static async createConversation(conversation: Database['public']['Tables']['conversations']['Insert']) {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        ...conversation,
        last_message_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Real-time subscriptions
  static subscribeToMessages(conversationId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        callback
      )
      .subscribe();
  }

  static subscribeToConversations(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `patient_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  // Utility functions
  static async getUserStats(userId: string) {
    const [appointments, checklistItems, documents, medications] = await Promise.all([
      this.getAppointments(userId),
      this.getChecklistItems(userId),
      this.getDocuments(userId),
      this.getMedications(userId)
    ]);

    const completedTasks = checklistItems.filter(item => item.completed).length;
    const upcomingAppointments = appointments.filter(apt => 
      new Date(apt.date) >= new Date()
    ).length;

    return {
      totalAppointments: appointments.length,
      upcomingAppointments,
      totalTasks: checklistItems.length,
      completedTasks,
      completionPercentage: checklistItems.length > 0 
        ? Math.round((completedTasks / checklistItems.length) * 100) 
        : 0,
      totalDocuments: documents.length,
      totalMedications: medications.length
    };
  }
}
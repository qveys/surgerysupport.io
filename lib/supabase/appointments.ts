import { supabase } from './client';
import type { Database } from './types';

export type Appointment = Database['public']['Tables']['appointments']['Row'];
export type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
export type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

export class AppointmentService {
  // Get all appointments for a user
  static async getUserAppointments(userId: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Get a specific appointment
  static async getAppointment(appointmentId: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    return data;
  }

  // Create a new appointment
  static async createAppointment(appointment: AppointmentInsert) {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update an appointment
  static async updateAppointment(appointmentId: string, updates: AppointmentUpdate) {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Reschedule an appointment (update only date and time)
  static async rescheduleAppointment(
    appointmentId: string, 
    newDate: Date, 
    newTime: string
  ) {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        date: newDate.toISOString(),
        time: newTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Soft delete an appointment
  static async deleteAppointment(appointmentId: string) {
    const { error } = await supabase
      .from('appointments')
      .update({ 
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);

    if (error) throw error;
  }

  // Check appointment availability
  static async checkAvailability(
    date: Date, 
    time: string, 
    providerId?: string,
    excludeAppointmentId?: string
  ) {
    let query = supabase
      .from('appointments')
      .select('id')
      .eq('date', date.toISOString().split('T')[0])
      .eq('time', time)
      .is('deleted_at', null);

    if (providerId) {
      query = query.eq('provider', providerId);
    }

    if (excludeAppointmentId) {
      query = query.neq('id', excludeAppointmentId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.length === 0; // Available if no conflicts found
  }

  // Get upcoming appointments
  static async getUpcomingAppointments(userId: string, limit: number = 5) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .gte('date', today)
      .is('deleted_at', null)
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  // Get past appointments
  static async getPastAppointments(userId: string, limit: number = 10) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .lt('date', today)
      .is('deleted_at', null)
      .order('date', { ascending: false })
      .order('time', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  // Get appointments by date range
  static async getAppointmentsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .is('deleted_at', null)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Get appointments by type
  static async getAppointmentsByType(userId: string, type: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .is('deleted_at', null)
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Search appointments
  static async searchAppointments(userId: string, searchTerm: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .or(`title.ilike.%${searchTerm}%,provider.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Get appointment statistics
  static async getAppointmentStats(userId: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('type, date')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (error) throw error;

    const today = new Date();
    const stats = {
      total: data.length,
      upcoming: data.filter(apt => new Date(apt.date) >= today).length,
      past: data.filter(apt => new Date(apt.date) < today).length,
      byType: data.reduce((acc, apt) => {
        acc[apt.type] = (acc[apt.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    return stats;
  }
}
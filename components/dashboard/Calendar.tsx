'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, Video, Stethoscope, Edit3, Trash2, Save, X, Loader2, Shield } from 'lucide-react';
import { RescheduleButton } from '@/components/dashboard/appointments/RescheduleButton';
import { useAuth } from '@/contexts/AuthContext';
import { DatabaseService } from '@/lib/supabase/database';
import { toast } from 'sonner';

interface CalendarProps {
  user: any;
}

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'surgery' | 'consultation' | 'follow-up' | 'test';
  provider: string;
  location: string;
  isVirtual?: boolean;
  notes?: string;
}

interface NewAppointmentForm {
  title: string;
  date: string;
  time: string;
  type: 'surgery' | 'consultation' | 'follow-up' | 'test';
  provider: string;
  location: string;
  isVirtual: boolean;
  notes: string;
}

export default function Calendar({ user }: CalendarProps) {
  const { user: authUser, hasRole } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deletingAppointmentId, setDeletingAppointmentId] = useState<string | null>(null);

  // Form state
  const [newAppointmentForm, setNewAppointmentForm] = useState<NewAppointmentForm>({
    title: '',
    date: '',
    time: '',
    type: 'consultation',
    provider: '',
    location: '',
    isVirtual: false,
    notes: ''
  });

  // Check if user can manage appointments (staff only)
  const canManageAppointments = hasRole('Recovery Coordinator', 'Nurse', 'Clinic Administrator');
  const isPatient = hasRole('Patient');

  // Load appointments from database on component mount
  useEffect(() => {
    if (authUser?.id) {
      loadAppointments();
    }
  }, [authUser?.id]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      
      // Load appointments from database
      const dbAppointments = await DatabaseService.getAppointments(authUser?.id);
      
      // Transform database appointments to match our interface
      const transformedAppointments: Appointment[] = dbAppointments.map(apt => ({
        id: apt.id,
        title: apt.title,
        date: apt.date.split('T')[0], // Extract date part
        time: apt.time,
        type: apt.type as 'surgery' | 'consultation' | 'follow-up' | 'test',
        provider: apt.provider || 'Healthcare Provider',
        location: apt.location || 'Medical Center',
        isVirtual: apt.is_virtual,
        notes: apt.notes || undefined
      }));

      // Add default appointments if no appointments exist and user is staff
      if (transformedAppointments.length === 0 && canManageAppointments) {
        await createDefaultAppointments();
        // Reload after creating default appointments
        const newDbAppointments = await DatabaseService.getAppointments(authUser?.id);
        const newTransformedAppointments: Appointment[] = newDbAppointments.map(apt => ({
          id: apt.id,
          title: apt.title,
          date: apt.date.split('T')[0],
          time: apt.time,
          type: apt.type as 'surgery' | 'consultation' | 'follow-up' | 'test',
          provider: apt.provider || 'Healthcare Provider',
          location: apt.location || 'Medical Center',
          isVirtual: apt.is_virtual,
          notes: apt.notes || undefined
        }));
        setAppointments(newTransformedAppointments);
      } else {
        setAppointments(transformedAppointments);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultAppointments = async () => {
    const defaultAppointments = [
      {
        title: 'Knee Replacement Surgery',
        date: '2024-02-15T08:00:00Z',
        time: '08:00',
        type: 'surgery',
        provider: 'Dr. Sarah Johnson',
        location: 'Main Hospital - OR 3',
        is_virtual: false,
        notes: 'Arrive 2 hours early. Fasting required.'
      },
      {
        title: 'Pre-operative Consultation',
        date: '2024-02-10T14:00:00Z',
        time: '14:00',
        type: 'consultation',
        provider: 'Dr. Sarah Johnson',
        location: 'Orthopedic Clinic - Room 205',
        is_virtual: false,
        notes: null
      },
      {
        title: 'Post-op Follow-up',
        date: '2024-02-22T10:00:00Z',
        time: '10:00',
        type: 'follow-up',
        provider: 'Dr. Sarah Johnson',
        location: 'Orthopedic Clinic - Room 205',
        is_virtual: false,
        notes: null
      },
      {
        title: 'Physical Therapy Assessment',
        date: '2024-02-25T15:00:00Z',
        time: '15:00',
        type: 'consultation',
        provider: 'Sarah Martinez, PT',
        location: 'Rehabilitation Center',
        is_virtual: false,
        notes: null
      },
      {
        title: 'Virtual Check-in',
        date: '2024-02-28T11:00:00Z',
        time: '11:00',
        type: 'follow-up',
        provider: 'Dr. Sarah Johnson',
        location: 'Telemedicine',
        is_virtual: true,
        notes: null
      }
    ];

    // Create default appointments
    for (const appointment of defaultAppointments) {
      try {
        await DatabaseService.createAppointment({
          user_id: authUser!.id,
          ...appointment
        });
      } catch (error) {
        console.error('Error creating default appointment:', error);
      }
    }
  };

  const handleCreateAppointment = async () => {
    if (!canManageAppointments) {
      toast.error('Only healthcare staff can create appointments');
      return;
    }

    if (!newAppointmentForm.title.trim() || !newAppointmentForm.date || !newAppointmentForm.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Create in database
      const newAppointment = await DatabaseService.createAppointment({
        user_id: authUser!.id,
        title: newAppointmentForm.title,
        date: `${newAppointmentForm.date}T${newAppointmentForm.time}:00Z`,
        time: newAppointmentForm.time,
        type: newAppointmentForm.type,
        provider: newAppointmentForm.provider || 'Healthcare Provider',
        location: newAppointmentForm.location || 'Medical Center',
        is_virtual: newAppointmentForm.isVirtual,
        notes: newAppointmentForm.notes || null
      });

      // Transform and add to local state
      const transformedAppointment: Appointment = {
        id: newAppointment.id,
        title: newAppointment.title,
        date: newAppointment.date.split('T')[0],
        time: newAppointment.time,
        type: newAppointment.type as 'surgery' | 'consultation' | 'follow-up' | 'test',
        provider: newAppointment.provider || 'Healthcare Provider',
        location: newAppointment.location || 'Medical Center',
        isVirtual: newAppointment.is_virtual,
        notes: newAppointment.notes || undefined
      };

      setAppointments(prev => [...prev, transformedAppointment]);

      // Reset form
      setNewAppointmentForm({
        title: '',
        date: '',
        time: '',
        type: 'consultation',
        provider: '',
        location: '',
        isVirtual: false,
        notes: ''
      });

      setShowNewAppointmentModal(false);
      toast.success('Appointment created successfully');
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment');
    }
  };

  const handleEditAppointment = async () => {
    if (!canManageAppointments) {
      toast.error('Only healthcare staff can edit appointments');
      return;
    }

    if (!editingAppointment) return;

    try {
      // Update in database
      await DatabaseService.updateAppointment(editingAppointment.id, {
        title: editingAppointment.title,
        date: `${editingAppointment.date}T${editingAppointment.time}:00Z`,
        time: editingAppointment.time,
        type: editingAppointment.type,
        provider: editingAppointment.provider,
        location: editingAppointment.location,
        is_virtual: editingAppointment.isVirtual,
        notes: editingAppointment.notes || null
      });

      // Update local state
      setAppointments(appointments =>
        appointments.map(apt => apt.id === editingAppointment.id ? editingAppointment : apt)
      );

      setShowEditModal(false);
      setEditingAppointment(null);
      toast.success('Appointment updated successfully');
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const handleDeleteAppointment = async () => {
    if (!canManageAppointments) {
      toast.error('Only healthcare staff can delete appointments');
      return;
    }

    if (!deletingAppointmentId) return;

    try {
      // Delete from database (soft delete)
      await DatabaseService.deleteAppointment(deletingAppointmentId);

      // Remove from local state
      setAppointments(appointments => appointments.filter(apt => apt.id !== deletingAppointmentId));

      setShowDeleteModal(false);
      setDeletingAppointmentId(null);
      toast.success('Appointment deleted successfully');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to delete appointment');
    }
  };

  // Handle appointment rescheduling
  const handleReschedule = async (appointmentId: string, newDate: Date, newTime: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the appointment in database
      await DatabaseService.updateAppointment(appointmentId, {
        date: newDate.toISOString(),
        time: newTime
      });

      // Update local state
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId 
          ? { 
              ...apt, 
              date: newDate.toISOString().split('T')[0], 
              time: newTime 
            }
          : apt
      ));
      
      console.log(`Appointment ${appointmentId} rescheduled to ${newDate.toDateString()} at ${newTime}`);
    } catch (error) {
      throw new Error('Error rescheduling appointment');
    }
  };

  // Handle notification sending
  const handleNotificationSent = (appointmentId: string, participants: string[]) => {
    console.log(`Notifications sent for appointment ${appointmentId} to:`, participants);
    // Here you would typically call your notification service
  };

  // Generate some mock available slots
  const generateAvailableSlots = () => {
    const slots = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
        // Randomly remove some slots to simulate bookings
        const availableTimes = times.filter(() => Math.random() > 0.3);
        
        if (availableTimes.length > 0) {
          slots.push({ date, times: availableTimes });
        }
      }
    }
    
    return slots;
  };

  const availableSlots = generateAvailableSlots();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'surgery': return 'bg-red-100 text-red-800 border-red-200';
      case 'consultation': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'follow-up': return 'bg-green-100 text-green-800 border-green-200';
      case 'test': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'surgery': return <Stethoscope className="w-4 h-4" />;
      case 'consultation': return <CalendarIcon className="w-4 h-4" />;
      case 'follow-up': return <Clock className="w-4 h-4" />;
      case 'test': return <Plus className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const sortedAppointments = appointments.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const upcomingAppointments = sortedAppointments.filter(
    apt => new Date(apt.date) >= new Date()
  );

  const pastAppointments = sortedAppointments.filter(
    apt => new Date(apt.date) < new Date()
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const openEditModal = (appointment: Appointment) => {
    if (!canManageAppointments) {
      toast.error('Only healthcare staff can edit appointments');
      return;
    }
    setEditingAppointment({ ...appointment });
    setShowEditModal(true);
  };

  const openDeleteModal = (appointmentId: string) => {
    if (!canManageAppointments) {
      toast.error('Only healthcare staff can delete appointments');
      return;
    }
    setDeletingAppointmentId(appointmentId);
    setShowDeleteModal(true);
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="surgery-card hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getTypeIcon(appointment.type)}
            <h3 className="font-semibold text-gray-900">{appointment.title}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={getTypeColor(appointment.type)}>
              {appointment.type}
            </Badge>
            {canManageAppointments && (
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(appointment)}
                  className="h-8 w-8 p-0"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openDeleteModal(appointment.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4" />
            <span>{formatDate(appointment.date)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>{appointment.time}</span>
          </div>
          <div className="flex items-center space-x-2">
            {appointment.isVirtual ? (
              <Video className="w-4 h-4 text-blue-600" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
            <span>{appointment.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-4 h-4" />
            <span>{appointment.provider}</span>
          </div>
        </div>

        {appointment.notes && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> {appointment.notes}
            </p>
          </div>
        )}

        <div className="mt-4 flex justify-end space-x-2">
          {appointment.isVirtual && (
            <Button size="sm" variant="outline" className="text-blue-600 border-blue-200">
              <Video className="w-4 h-4 mr-2" />
              Join Virtual Visit
            </Button>
          )}
          <RescheduleButton
            appointment={appointment}
            onReschedule={handleReschedule}
            onNotificationSent={handleNotificationSent}
            availableSlots={availableSlots}
          />
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading appointments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Calendar & Appointments</h2>
          <p className="text-gray-600">
            {isPatient 
              ? 'View your scheduled medical appointments' 
              : 'Manage medical appointments and schedule'
            }
          </p>
        </div>
        {canManageAppointments && (
          <Button 
            onClick={() => setShowNewAppointmentModal(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Appointment
          </Button>
        )}
      </div>

      {/* Patient Notice */}
      {isPatient && (
        <Card className="surgery-card bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">Appointment Management</h3>
                <p className="text-sm text-blue-800">
                  Your healthcare team manages your appointments. To request a new appointment or make changes, 
                  please contact your care coordinator or use the messaging system.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="surgery-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-2">
              {upcomingAppointments.length}
            </div>
            <div className="text-sm text-gray-600">Upcoming Appointments</div>
          </CardContent>
        </Card>
        <Card className="surgery-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {pastAppointments.length}
            </div>
            <div className="text-sm text-gray-600">Completed Appointments</div>
          </CardContent>
        </Card>
        <Card className="surgery-card">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {appointments.filter(a => a.isVirtual).length}
            </div>
            <div className="text-sm text-gray-600">Virtual Visits</div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card className="surgery-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <span>Upcoming Appointments</span>
          </CardTitle>
          <CardDescription>
            Your scheduled medical appointments and procedures
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No upcoming appointments scheduled</p>
              {canManageAppointments && (
                <Button 
                  onClick={() => setShowNewAppointmentModal(true)}
                  className="mt-4 bg-primary hover:bg-primary/90"
                >
                  Schedule Your First Appointment
                </Button>
              )}
              {isPatient && (
                <p className="mt-4 text-sm text-gray-600">
                  Contact your healthcare team to schedule appointments
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <Card className="surgery-card">
          <CardHeader>
            <CardTitle>Past Appointments</CardTitle>
            <CardDescription>
              Your appointment history and completed visits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastAppointments.map((appointment) => (
                <div key={appointment.id} className="opacity-75">
                  <AppointmentCard appointment={appointment} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Appointment Modal - Only for Staff */}
      {canManageAppointments && (
        <Dialog open={showNewAppointmentModal} onOpenChange={setShowNewAppointmentModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Appointment</DialogTitle>
              <DialogDescription>
                Create a new medical appointment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appointment-title">Appointment Title *</Label>
                <Input
                  id="appointment-title"
                  placeholder="Enter appointment title..."
                  value={newAppointmentForm.title}
                  onChange={(e) => setNewAppointmentForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointment-date">Date *</Label>
                  <Input
                    id="appointment-date"
                    type="date"
                    value={newAppointmentForm.date}
                    onChange={(e) => setNewAppointmentForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appointment-time">Time *</Label>
                  <Input
                    id="appointment-time"
                    type="time"
                    value={newAppointmentForm.time}
                    onChange={(e) => setNewAppointmentForm(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appointment-type">Type</Label>
                <Select 
                  value={newAppointmentForm.type} 
                  onValueChange={(value: 'surgery' | 'consultation' | 'follow-up' | 'test') => 
                    setNewAppointmentForm(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="surgery">Surgery</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                    <SelectItem value="test">Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appointment-provider">Healthcare Provider</Label>
                <Input
                  id="appointment-provider"
                  placeholder="Enter provider name..."
                  value={newAppointmentForm.provider}
                  onChange={(e) => setNewAppointmentForm(prev => ({ ...prev, provider: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appointment-location">Location</Label>
                <Input
                  id="appointment-location"
                  placeholder="Enter location..."
                  value={newAppointmentForm.location}
                  onChange={(e) => setNewAppointmentForm(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="appointment-virtual"
                  checked={newAppointmentForm.isVirtual}
                  onCheckedChange={(checked) => setNewAppointmentForm(prev => ({ ...prev, isVirtual: checked as boolean }))}
                />
                <Label htmlFor="appointment-virtual">Virtual appointment</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appointment-notes">Notes</Label>
                <Textarea
                  id="appointment-notes"
                  placeholder="Enter any additional notes..."
                  value={newAppointmentForm.notes}
                  onChange={(e) => setNewAppointmentForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewAppointmentModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateAppointment}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Appointment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Appointment Modal - Only for Staff */}
      {canManageAppointments && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Appointment</DialogTitle>
              <DialogDescription>
                Update appointment details
              </DialogDescription>
            </DialogHeader>
            {editingAppointment && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-appointment-title">Appointment Title</Label>
                  <Input
                    id="edit-appointment-title"
                    value={editingAppointment.title}
                    onChange={(e) => setEditingAppointment(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-appointment-date">Date</Label>
                    <Input
                      id="edit-appointment-date"
                      type="date"
                      value={editingAppointment.date}
                      onChange={(e) => setEditingAppointment(prev => prev ? ({ ...prev, date: e.target.value }) : null)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-appointment-time">Time</Label>
                    <Input
                      id="edit-appointment-time"
                      type="time"
                      value={editingAppointment.time}
                      onChange={(e) => setEditingAppointment(prev => prev ? ({ ...prev, time: e.target.value }) : null)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-appointment-type">Type</Label>
                  <Select 
                    value={editingAppointment.type} 
                    onValueChange={(value: 'surgery' | 'consultation' | 'follow-up' | 'test') => 
                      setEditingAppointment(prev => prev ? ({ ...prev, type: value }) : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="surgery">Surgery</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="test">Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-appointment-provider">Healthcare Provider</Label>
                  <Input
                    id="edit-appointment-provider"
                    value={editingAppointment.provider}
                    onChange={(e) => setEditingAppointment(prev => prev ? ({ ...prev, provider: e.target.value }) : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-appointment-location">Location</Label>
                  <Input
                    id="edit-appointment-location"
                    value={editingAppointment.location}
                    onChange={(e) => setEditingAppointment(prev => prev ? ({ ...prev, location: e.target.value }) : null)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-appointment-virtual"
                    checked={editingAppointment.isVirtual}
                    onCheckedChange={(checked) => setEditingAppointment(prev => prev ? ({ ...prev, isVirtual: checked as boolean }) : null)}
                  />
                  <Label htmlFor="edit-appointment-virtual">Virtual appointment</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-appointment-notes">Notes</Label>
                  <Textarea
                    id="edit-appointment-notes"
                    value={editingAppointment.notes || ''}
                    onChange={(e) => setEditingAppointment(prev => prev ? ({ ...prev, notes: e.target.value }) : null)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleEditAppointment}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal - Only for Staff */}
      {canManageAppointments && (
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Appointment</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this appointment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteAppointment}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Appointment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

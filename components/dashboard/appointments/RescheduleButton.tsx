'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, User, MapPin, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { format, addDays, isBefore, isToday, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  provider: string;
  location: string;
  isVirtual?: boolean;
  notes?: string;
}

interface RescheduleButtonProps {
  appointment: Appointment;
  onReschedule?: (appointmentId: string, newDate: Date, newTime: string) => Promise<void>;
  onNotificationSent?: (appointmentId: string, participants: string[]) => void;
  availableSlots?: { date: Date; times: string[] }[];
  className?: string;
}

export function RescheduleButton({ 
  appointment, 
  onReschedule, 
  onNotificationSent,
  availableSlots = [],
  className = ""
}: RescheduleButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  // Generate available time slots (9h-17h, every 30 minutes)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 17 && minute > 0) break; // Stop at 17:00
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Check if a date is available for booking
  const isDateAvailable = (date: Date) => {
    // Don't allow past dates
    if (isBefore(date, new Date()) && !isToday(date)) {
      return false;
    }
    
    // Don't allow weekends for medical appointments
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return false;
    }

    return true;
  };

  // Get available times for selected date
  const getAvailableTimesForDate = (date: Date) => {
    const availableSlot = availableSlots.find(slot => 
      isSameDay(slot.date, date)
    );
    
    if (availableSlot) {
      return availableSlot.times;
    }
    
    // Default available times if no specific slots provided
    return timeSlots.filter(time => {
      if (isToday(date)) {
        const currentHour = new Date().getHours();
        const currentMinute = new Date().getMinutes();
        const [slotHour, slotMinute] = time.split(':').map(Number);
        
        // Only show future times for today
        return slotHour > currentHour || (slotHour === currentHour && slotMinute > currentMinute + 30);
      }
      return true;
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
    setError('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setError('');
  };

  const validateNewSlot = () => {
    if (!selectedDate || !selectedTime) {
      setError('Veuillez sélectionner une date et une heure');
      return false;
    }

    const availableTimes = getAvailableTimesForDate(selectedDate);
    if (!availableTimes.includes(selectedTime)) {
      setError('Ce créneau n\'est pas disponible');
      return false;
    }

    // Check if it's the same as current appointment
    const currentDate = new Date(appointment.date);
    if (isSameDay(selectedDate, currentDate) && selectedTime === appointment.time) {
      setError('Veuillez sélectionner une date ou heure différente');
      return false;
    }

    return true;
  };

  const handleReschedule = async () => {
    if (!validateNewSlot()) return;

    setIsLoading(true);
    setError('');

    try {
      // Call the reschedule function
      if (onReschedule) {
        await onReschedule(appointment.id, selectedDate!, selectedTime);
      }

      // Simulate notification sending
      setTimeout(() => {
        if (onNotificationSent) {
          onNotificationSent(appointment.id, [appointment.provider]);
        }
      }, 1000);

      setSuccess(true);
      
      // Close dialog after success
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setSelectedDate(undefined);
        setSelectedTime('');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Erreur lors de la reprogrammation');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedDate(undefined);
    setSelectedTime('');
    setError('');
    setSuccess(false);
  };

  const formatCurrentDate = () => {
    return format(new Date(appointment.date), 'EEEE d MMMM yyyy', { locale: fr });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={`inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 ${className}`}
        >
          <CalendarDays className="w-4 h-4 mr-2" />
          Reprogrammer
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            <span>Reprogrammer le rendez-vous</span>
          </DialogTitle>
          <DialogDescription>
            Modifiez la date et l'heure de votre rendez-vous. Toutes les autres informations seront conservées.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-900">Rendez-vous reprogrammé !</h3>
              <p className="text-sm text-green-700 mt-1">
                Une notification a été envoyée à {appointment.provider}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Appointment Info */}
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-3">Rendez-vous actuel</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-4 h-4 text-gray-500" />
                  <span>{formatCurrentDate()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{appointment.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>{appointment.provider}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{appointment.location}</span>
                </div>
              </div>
              <div className="mt-3">
                <Badge variant="outline" className="text-xs">
                  {appointment.type}
                </Badge>
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Nouvelle date</Label>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => !isDateAvailable(date)}
                  initialFocus
                  className="rounded-md border"
                  fromDate={new Date()}
                  toDate={addDays(new Date(), 90)} // Allow booking up to 3 months ahead
                />
              </div>
              {selectedDate && (
                <div className="text-center text-sm text-gray-600">
                  Date sélectionnée: {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                </div>
              )}
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Nouvelle heure</Label>
                <Select value={selectedTime} onValueChange={handleTimeSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une heure" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableTimesForDate(selectedDate).map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedDate && getAvailableTimesForDate(selectedDate).length === 0 && (
                  <div className="flex items-center space-x-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span>Aucun créneau disponible pour cette date</span>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Confirmation Summary */}
            {selectedDate && selectedTime && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Résumé de la reprogrammation</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>Nouvelle date:</span>
                    <span className="font-medium">
                      {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nouvelle heure:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rendez-vous:</span>
                    <span className="font-medium">{appointment.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avec:</span>
                    <span className="font-medium">{appointment.provider}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleReschedule}
                disabled={!selectedDate || !selectedTime || isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Reprogrammation...
                  </>
                ) : (
                  <>
                    <CalendarDays className="w-4 h-4 mr-2" />
                    Confirmer la reprogrammation
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
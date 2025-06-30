export interface NotificationRecipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export interface AppointmentNotification {
  type: 'reschedule' | 'cancel' | 'reminder' | 'new';
  appointmentId: string;
  appointmentTitle: string;
  oldDate?: Date;
  oldTime?: string;
  newDate?: Date;
  newTime?: string;
  patientName: string;
  providerName: string;
  location: string;
  notes?: string;
}

export class NotificationService {
  // Send appointment reschedule notification
  static async sendRescheduleNotification(
    notification: AppointmentNotification,
    recipients: NotificationRecipient[]
  ) {
    try {
      // Simulate API call to notification service
      await new Promise(resolve => setTimeout(resolve, 1000));

      const emailPromises = recipients.map(recipient => 
        this.sendEmail(recipient, notification)
      );

      const smsPromises = recipients
        .filter(recipient => recipient.phone)
        .map(recipient => this.sendSMS(recipient, notification));

      await Promise.all([...emailPromises, ...smsPromises]);

      // Log notification for audit trail
      await this.logNotification(notification, recipients);

      return { success: true, sentTo: recipients.length };
    } catch (error) {
      console.error('Failed to send notifications:', error);
      throw new Error('Échec de l\'envoi des notifications');
    }
  }

  // Send email notification
  private static async sendEmail(
    recipient: NotificationRecipient,
    notification: AppointmentNotification
  ) {
    const subject = this.getEmailSubject(notification);
    const body = this.getEmailBody(notification, recipient);

    // In a real implementation, you would use a service like SendGrid, AWS SES, etc.
    console.log(`📧 Email sent to ${recipient.email}:`, {
      subject,
      body: body.substring(0, 100) + '...'
    });

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Send SMS notification
  private static async sendSMS(
    recipient: NotificationRecipient,
    notification: AppointmentNotification
  ) {
    const message = this.getSMSMessage(notification);

    // In a real implementation, you would use a service like Twilio, AWS SNS, etc.
    console.log(`📱 SMS sent to ${recipient.phone}:`, message);

    // Simulate SMS sending
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Generate email subject
  private static getEmailSubject(notification: AppointmentNotification): string {
    switch (notification.type) {
      case 'reschedule':
        return `Rendez-vous reprogrammé - ${notification.appointmentTitle}`;
      case 'cancel':
        return `Rendez-vous annulé - ${notification.appointmentTitle}`;
      case 'reminder':
        return `Rappel de rendez-vous - ${notification.appointmentTitle}`;
      case 'new':
        return `Nouveau rendez-vous - ${notification.appointmentTitle}`;
      default:
        return `Notification de rendez-vous - ${notification.appointmentTitle}`;
    }
  }

  // Generate email body
  private static getEmailBody(
    notification: AppointmentNotification,
    recipient: NotificationRecipient
  ): string {
    const baseInfo = `
Bonjour ${recipient.name},

Voici les détails de votre rendez-vous :

📋 Rendez-vous : ${notification.appointmentTitle}
👨‍⚕️ Avec : ${notification.providerName}
📍 Lieu : ${notification.location}
👤 Patient : ${notification.patientName}
`;

    switch (notification.type) {
      case 'reschedule':
        return `${baseInfo}

🔄 RENDEZ-VOUS REPROGRAMMÉ

Ancienne date : ${notification.oldDate?.toLocaleDateString('fr-FR')} à ${notification.oldTime}
Nouvelle date : ${notification.newDate?.toLocaleDateString('fr-FR')} à ${notification.newTime}

${notification.notes ? `📝 Notes : ${notification.notes}` : ''}

Merci de noter ce changement dans votre agenda.

Cordialement,
L'équipe Surgery Support
`;

      case 'cancel':
        return `${baseInfo}

❌ RENDEZ-VOUS ANNULÉ

Date annulée : ${notification.oldDate?.toLocaleDateString('fr-FR')} à ${notification.oldTime}

${notification.notes ? `📝 Raison : ${notification.notes}` : ''}

Veuillez nous contacter pour reprogrammer si nécessaire.

Cordialement,
L'équipe Surgery Support
`;

      case 'reminder':
        return `${baseInfo}

⏰ RAPPEL DE RENDEZ-VOUS

Date : ${notification.newDate?.toLocaleDateString('fr-FR')} à ${notification.newTime}

${notification.notes ? `📝 Instructions : ${notification.notes}` : ''}

N'oubliez pas votre rendez-vous !

Cordialement,
L'équipe Surgery Support
`;

      default:
        return baseInfo;
    }
  }

  // Generate SMS message
  private static getSMSMessage(notification: AppointmentNotification): string {
    switch (notification.type) {
      case 'reschedule':
        return `Surgery Support: Votre RDV "${notification.appointmentTitle}" a été reprogrammé au ${notification.newDate?.toLocaleDateString('fr-FR')} à ${notification.newTime}. Avec ${notification.providerName}.`;
      
      case 'cancel':
        return `Surgery Support: Votre RDV "${notification.appointmentTitle}" du ${notification.oldDate?.toLocaleDateString('fr-FR')} a été annulé. Contactez-nous pour reprogrammer.`;
      
      case 'reminder':
        return `Surgery Support: Rappel RDV "${notification.appointmentTitle}" demain ${notification.newTime} avec ${notification.providerName}. Lieu: ${notification.location}`;
      
      default:
        return `Surgery Support: Notification concernant votre RDV "${notification.appointmentTitle}".`;
    }
  }

  // Log notification for audit trail
  private static async logNotification(
    notification: AppointmentNotification,
    recipients: NotificationRecipient[]
  ) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'notification_sent',
      appointmentId: notification.appointmentId,
      notificationType: notification.type,
      recipientCount: recipients.length,
      recipients: recipients.map(r => ({ id: r.id, email: r.email, role: r.role }))
    };

    // In a real implementation, you would save this to your audit log table
    console.log('📝 Notification logged:', logEntry);
  }

  // Get notification preferences for a user
  static async getNotificationPreferences(userId: string) {
    // In a real implementation, you would fetch from user preferences table
    return {
      email: true,
      sms: true,
      push: false,
      rescheduleNotifications: true,
      reminderNotifications: true,
      cancelNotifications: true
    };
  }

  // Update notification preferences
  static async updateNotificationPreferences(
    userId: string,
    preferences: Record<string, boolean>
  ) {
    // In a real implementation, you would update the user preferences table
    console.log(`Updated notification preferences for user ${userId}:`, preferences);
  }
}
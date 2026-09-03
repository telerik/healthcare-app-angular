import { Injectable } from '@angular/core';
import { getAppointmentsData, SchedulerAppointment, GridAppointment } from '../data/appointments.data';

export type { SchedulerAppointment, GridAppointment };

export interface NextAppointment {
  patientId: number;
  time: string;
  reason: string;
  room: string;
  start: Date;
}

@Injectable({
  providedIn: 'root',
})
export class AppointmentsService {
  private cachedAppointments: SchedulerAppointment[] | null = null;

  // Initialize cache with hardcoded appointments
  private ensureAppointmentsLoaded(): void {
    if (!this.cachedAppointments) {
      this.cachedAppointments = getAppointmentsData();
    }
  }

  // Public method to get all scheduler appointments
  public getSchedulerAppointments(): SchedulerAppointment[] {
    this.ensureAppointmentsLoaded();
    return this.cachedAppointments!;
  }

  // Get today's appointments for the grid
  public getTodaysAppointments(): GridAppointment[] {
    this.ensureAppointmentsLoaded();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter today's appointments from cached data
    const schedulerAppointments = this.cachedAppointments!.filter((apt) => {
      const aptDate = new Date(apt.start);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate.getTime() === today.getTime();
    });

    return schedulerAppointments.map((apt) => {
      // Use hardcoded status from mock data, or default to 'Upcoming'
      const status = apt.status || (apt.cancelled ? 'Cancelled' : 'Upcoming');

      return {
        time: this.formatTime(apt.start),
        patientName: apt.title,
        reason: apt.reason,
        status,
        room: apt.description,
      };
    });
  }

  // Resolve the next eligible (linked, non-cancelled) appointment for today
  public getNextAppointment(): NextAppointment | null {
    this.ensureAppointmentsLoaded();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eligible = this.cachedAppointments!.filter((apt) => {
      const aptDate = new Date(apt.start);
      aptDate.setHours(0, 0, 0, 0);
      const isToday = aptDate.getTime() === today.getTime();
      const status = apt.status || (apt.cancelled ? 'Cancelled' : 'Upcoming');
      const isEligibleStatus = status === 'In Progress' || status === 'Upcoming';
      return isToday && apt.cancelled !== true && isEligibleStatus && apt.patientId != null;
    });

    if (eligible.length === 0) {
      return null;
    }

    const next = [...eligible].sort((a, b) => a.start.getTime() - b.start.getTime())[0];

    return {
      patientId: next.patientId!,
      time: this.formatTime(next.start),
      reason: next.reason,
      room: next.description,
      start: next.start,
    };
  }

  // Helper method
  private formatTime(date: Date): string {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes.toString().padStart(2, '0');
    return `${hours.toString().padStart(2, '0')}:${minutesStr} ${ampm}`;
  }
}

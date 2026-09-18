import { TestBed } from '@angular/core/testing';
import { AppointmentsService } from './appointments.service';

describe('AppointmentsService', () => {
  let service: AppointmentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppointmentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return scheduler appointments', () => {
    const appointments = service.getSchedulerAppointments();

    expect(Array.isArray(appointments)).toBe(true);
    expect(appointments.length).toBeGreaterThan(0);
  });

  it('should return todays appointments as grid items', () => {
    const todayItems = service.getTodaysAppointments();

    expect(Array.isArray(todayItems)).toBe(true);

    if (todayItems.length > 0) {
      expect(todayItems[0]).toEqual(
        expect.objectContaining({
          time: expect.any(String),
          patientName: expect.any(String),
          reason: expect.any(String),
          status: expect.any(String),
          room: expect.any(String),
        }),
      );
    }
  });

  it('should return the earliest eligible next appointment with a resolvable patientId', () => {
    const next = service.getNextAppointment();

    expect(next).not.toBeNull();
    expect(next).toEqual(
      expect.objectContaining({
        patientId: expect.any(Number),
        time: expect.any(String),
        reason: expect.any(String),
        room: expect.any(String),
        start: expect.any(Date),
      }),
    );
  });

  it('should never return a Cancelled or Complete appointment', () => {
    const schedulerAppointments = service.getSchedulerAppointments();
    const next = service.getNextAppointment();

    expect(next).not.toBeNull();
    const matched = schedulerAppointments.find(
      (apt) => apt.patientId === next!.patientId && apt.start.getTime() === next!.start.getTime(),
    );
    expect(matched?.status).not.toBe('Cancelled');
    expect(matched?.status).not.toBe('Complete');
  });

  it('should return the earliest start time among all eligible (In Progress/Upcoming, linked) appointments today', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const schedulerAppointments = service.getSchedulerAppointments();
    const eligibleToday = schedulerAppointments.filter((apt) => {
      const aptDate = new Date(apt.start);
      aptDate.setHours(0, 0, 0, 0);
      const status = apt.status || (apt.cancelled ? 'Cancelled' : 'Upcoming');
      return (
        aptDate.getTime() === today.getTime() &&
        apt.cancelled !== true &&
        (status === 'In Progress' || status === 'Upcoming') &&
        apt.patientId != null
      );
    });
    const earliest = [...eligibleToday].sort((a, b) => a.start.getTime() - b.start.getTime())[0];

    const next = service.getNextAppointment();

    expect(next!.start.getTime()).toBe(earliest.start.getTime());
    expect(next!.patientId).toBe(earliest.patientId);
  });
});
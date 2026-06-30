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
});
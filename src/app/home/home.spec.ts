import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { RowPinEvent } from '@progress/kendo-angular-grid';
import { HomeComponent } from './home';
import { GridAppointment } from '../services/appointments.service';

describe('HomeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([]), provideNoopAnimations()],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
  });

  it('should pin the Isabella Rossi upcoming appointment to the top of the grid on init', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();

    expect(component.pinnedTopRows.length).toBe(1);
    expect(component.pinnedTopRows[0].patientName).toBe('Isabella Rossi');
    expect(component.appointments).toContainEqual(
      expect.objectContaining({ patientName: 'Isabella Rossi' }),
    );
  });

  it('should sync pinnedTopRows when the grid emits a rowPinChange event', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const newPinnedRow: GridAppointment = {
      id: 999,
      time: '11:00 AM',
      patientName: 'Test Patient',
      reason: 'Test Reason',
      status: 'Upcoming',
      room: '100 (Floor 1)',
    };
    const event: RowPinEvent = {
      dataItem: newPinnedRow,
      pinnedTopRows: [newPinnedRow],
      pinnedBottomRows: [],
    };

    component.onRowPinChange(event);

    expect(component.pinnedTopRows).toEqual([newPinnedRow]);
  });

  it('should clear pinnedTopRows when the user unpins every row', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.onRowPinChange({
      dataItem: component.pinnedTopRows[0],
      pinnedTopRows: [],
      pinnedBottomRows: [],
    });

    expect(component.pinnedTopRows).toEqual([]);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationWindowComponent } from './confirmation-window.component';

describe('ConfirmationWindowComponent', () => {
  let component: ConfirmationWindowComponent;
  let fixture: ComponentFixture<ConfirmationWindowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmationWindowComponent]
    });
    fixture = TestBed.createComponent(ConfirmationWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

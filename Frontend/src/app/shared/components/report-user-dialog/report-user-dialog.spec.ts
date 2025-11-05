import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportUserDialog } from './report-user-dialog';

describe('ReportUserDialog', () => {
  let component: ReportUserDialog;
  let fixture: ComponentFixture<ReportUserDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportUserDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportUserDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

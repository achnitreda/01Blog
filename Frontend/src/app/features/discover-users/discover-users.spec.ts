import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscoverUsers } from './discover-users';

describe('DiscoverUsers', () => {
  let component: DiscoverUsers;
  let fixture: ComponentFixture<DiscoverUsers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscoverUsers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscoverUsers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

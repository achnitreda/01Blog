import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostCreateDialog } from './post-create-dialog';

describe('PostCreateDialog', () => {
  let component: PostCreateDialog;
  let fixture: ComponentFixture<PostCreateDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostCreateDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostCreateDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

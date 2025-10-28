import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostEditDialog } from './post-edit-dialog';

describe('PostEditDialog', () => {
  let component: PostEditDialog;
  let fixture: ComponentFixture<PostEditDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostEditDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostEditDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

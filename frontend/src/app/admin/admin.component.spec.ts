import { TestBed } from '@angular/core/testing';

import { AdminComponent } from './admin.component';

describe('Admin Component', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({declarations: [AdminComponent]});
  });

  it('should ...', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.children[0].textContent).toContain('Admin Works!');
  });

});

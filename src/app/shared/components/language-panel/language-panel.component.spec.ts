import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguagePanelComponent } from './language-panel.component';

describe('PageNotFoundComponent', () => {
  let component: LanguagePanelComponent;
  let fixture: ComponentFixture<LanguagePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LanguagePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LanguagePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

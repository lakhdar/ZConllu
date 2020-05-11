import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SentPanelComponent } from './sent-panel.component';

describe('PageNotFoundComponent', () => {
  let component: SentPanelComponent;
  let fixture: ComponentFixture<SentPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SentPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SentPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

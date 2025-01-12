import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThreeJSDemoComponent } from './three-jsdemo.component';

describe('ThreeJSDemoComponent', () => {
  let component: ThreeJSDemoComponent;
  let fixture: ComponentFixture<ThreeJSDemoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThreeJSDemoComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThreeJSDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

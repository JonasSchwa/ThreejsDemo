import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ThreeJsOwnProjectComponent } from './three-js-own-project.component';

describe('ThreeJsOwnProjectComponent', () => {
  let component: ThreeJsOwnProjectComponent;
  let fixture: ComponentFixture<ThreeJsOwnProjectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ThreeJsOwnProjectComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ThreeJsOwnProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

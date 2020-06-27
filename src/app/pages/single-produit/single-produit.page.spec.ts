import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SingleProduitPage } from './single-produit.page';

describe('SingleProduitPage', () => {
  let component: SingleProduitPage;
  let fixture: ComponentFixture<SingleProduitPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleProduitPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SingleProduitPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

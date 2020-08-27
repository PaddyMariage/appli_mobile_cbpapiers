import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {OrderValidationPage} from './order-validation.page';

describe('OrderValidationPage', () => {
    let component: OrderValidationPage;
    let fixture: ComponentFixture<OrderValidationPage>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OrderValidationPage],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(OrderValidationPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {SingleOrderPage} from './single-order.page';

describe('SingleCommandePage', () => {
    let component: SingleOrderPage;
    let fixture: ComponentFixture<SingleOrderPage>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SingleOrderPage],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(SingleOrderPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

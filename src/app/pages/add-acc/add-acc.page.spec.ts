import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {AddAccPage} from './add-acc.page';

describe('AddAccPage', () => {
    let component: AddAccPage;
    let fixture: ComponentFixture<AddAccPage>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AddAccPage],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(AddAccPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

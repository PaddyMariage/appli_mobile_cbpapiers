import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {DeleteAccPage} from './delete-acc.page';

describe('DeleteAccPage', () => {
    let component: DeleteAccPage;
    let fixture: ComponentFixture<DeleteAccPage>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DeleteAccPage],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(DeleteAccPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

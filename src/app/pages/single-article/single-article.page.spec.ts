import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {IonicModule} from '@ionic/angular';

import {SingleArticlePage} from './single-article.page';

describe('SingleArticlePage', () => {
    let component: SingleArticlePage;
    let fixture: ComponentFixture<SingleArticlePage>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SingleArticlePage],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(SingleArticlePage);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

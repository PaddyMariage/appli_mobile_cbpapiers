import {TestBed} from '@angular/core/testing';

import {GenerateIDService} from './generate-id.service';

describe('GenerateIDService', () => {
    let service: GenerateIDService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GenerateIDService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

import {TestBed} from '@angular/core/testing';

import {WarehouseRetService} from './warehouse-ret.service';

describe('WarehouseRetService', () => {
    let service: WarehouseRetService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(WarehouseRetService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

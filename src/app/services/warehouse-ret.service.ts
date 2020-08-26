import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class WarehouseRetService {

    public toggle$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private statusShipping: boolean;

    constructor() {
    }

    setStatus(warehouseRetrieval: boolean) {
        this.toggle$.next(warehouseRetrieval);
    }

    getStatus() {
        return this.toggle$.getValue();
    }

    setStatusShipping(statusShipping: boolean) {
        this.statusShipping = statusShipping;
    }

    getStatusShipping() {
        return this.statusShipping;
    }
}

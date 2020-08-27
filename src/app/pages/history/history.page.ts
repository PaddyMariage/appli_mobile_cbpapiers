import {Component, OnDestroy, OnInit} from '@angular/core';
import {Order} from '../../models/Order';
import {OrderService} from '../../services/order.service';
import {UserService} from 'src/app/services/user.service';
import {F_COMPTET} from 'src/app/models/JSON/F_COMPTET';
import {Subscription} from "rxjs";

@Component({
    selector: 'app-historique',
    templateUrl: './history.page.html',
    styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit, OnDestroy {

    public history: Order[] = [];
    customer: F_COMPTET;
    orderActiveSub: Subscription;
    activeCustomerSub: Subscription;

    constructor(private orderService: OrderService,
                private userService: UserService) {
    }

    ngOnInit() {
        this.orderActiveSub = this.orderService.ordersActive$.subscribe(
            orders => {
                this.history = orders;
            });

        this.activeCustomerSub = this.userService.activeCustomer$.subscribe(
            customer => {
                // on met à jour le customer s'il est null ou différent de celui actif. Puis on retest l'historique
                if (this.customer == null || this.customer.CT_Num != customer.CT_Num) {
                    this.customer = customer;
                    this.orderService.initAndGetOrdersStorage()
                }
            });
    }

    onClickOrder(order: Order) {
        this.orderService.setOrder(order);
    }

    ngOnDestroy() {
        this.orderActiveSub.unsubscribe();
        this.activeCustomerSub.unsubscribe();
    }

}

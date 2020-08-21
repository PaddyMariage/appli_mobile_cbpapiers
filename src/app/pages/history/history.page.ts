import {Component, OnInit} from '@angular/core';
import {Order} from '../../models/Order';
import {OrderService} from '../../services/order.service';
import { UserService } from 'src/app/services/user.service';
import { F_COMPTET } from 'src/app/models/JSON/F_COMPTET';

@Component({
    selector: 'app-historique',
    templateUrl: './history.page.html',
    styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {

    public history: Order[] = [];
    customer : F_COMPTET;

    constructor(private orderService: OrderService,
                private userService : UserService) {
        
    }

    ngOnInit() {
        this.userService.activeCustomer$.subscribe(
            customer => {
                // on met à jour le customer s'il est null ou différent de celui actif. Puis on retest l'historique
                if(this.customer == null || this.customer.CT_Num != customer.CT_Num) {
                    this.customer = customer;
                    // on check s'il y a des commandes a afficher ou non puis on attribue ou non l'historique de commande
                    this.orderService.isOrdersStorageEmpty().then((boolean) => {
                        if (!boolean) {
                            this.orderService.initAndGetOrdersStorage().then((orders : Order[]) => {
                            this.history = orders;
                            });  
                        }
                    });
                       
                    }
                }
        );}



    onClickOrder(order: Order) {
        this.orderService.setOrder(order);
        this.orderService.setOrders(this.history);
    }


}

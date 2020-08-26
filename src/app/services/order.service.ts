import {Injectable} from '@angular/core';
import {Order} from "../models/Order";
import {Storage} from "@ionic/storage";
import {UserService} from './user.service';
import {BehaviorSubject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    public order$: BehaviorSubject<Order> = new BehaviorSubject<Order>(null);
    public ordersActive$: BehaviorSubject<Order[]> = new BehaviorSubject<Order[]>(null);
    private order: Order;
    private ordersActive: Order[] = [];

    constructor(private dataStorage: Storage,
                private userService: UserService) {
    }

    // pour transiter une Order (utilise dans l'history -> SingleOrder)
    setOrder(order: Order) {
        this.order$.next(order);
        this.order = order;
    }

    getOrder(): Order {
        return this.order;
    }

    getActiveOrders(): Order[] {
        return this.ordersActive;
    }

    setActiveOrders(orders: Order[]) {
        this.ordersActive$.next(orders);
        this.ordersActive = orders;
    }

    deleteOrder(order: Order) {
        this.ordersActive.splice(this.ordersActive.indexOf(order), 1);
        this.ordersActive$.next(this.ordersActive);

        this.dataStorage.set('orders' + this.userService.getActiveCustomer().CT_Num, JSON.stringify(this.ordersActive));
    }

    // Permet d'initialiser la liste d'historique à partir du storage et renvoie les commmandes appartenant à un compte.
    initAndGetOrdersStorage() {
        this.ordersActive = [];
        this.dataStorage.ready().then(() => {
            this.dataStorage.get('orders' + this.userService.getActiveCustomer().CT_Num).then((orders) => {
                if (orders != null) {
                    let ordersTotal: Order[] = JSON.parse(orders);
                    ordersTotal.sort((a, b) => (new Date(b.orderDate).valueOf() - new Date(a.orderDate).valueOf()));
                    this.setActiveOrders(ordersTotal);
                } else {
                    this.ordersActive = [];
                }
            });
        });
    }

    // Vérifie si c'est vide, si c'est le cas on ajoute simplement. Si non, on recupere d'abord le tableau puis on add
    addOrder(order: Order) {
        this.ordersActive.push(order);
        if (this.ordersActive.length > 20)
            this.ordersActive.splice(this.ordersActive.length, 1);
        this.ordersActive$.next(this.ordersActive);
        this.dataStorage.set('orders' + this.userService.getActiveCustomer().CT_Num, JSON.stringify(this.ordersActive))
    }

    editOrderStorage(order: Order) {
        // je récupérere le tableau de commande et je cherche l'index de l'objet qui a le même numéro de commande qu'order
        let found = false;
        let index = 0;
        while (!found && index < this.ordersActive.length) {
            if (this.ordersActive[index].orderNumber == order.orderNumber) {
                found = true;
                this.ordersActive.splice(index, 1, order);
            } else
                index++;
        }
        this.dataStorage.set('orders' + this.userService.getActiveCustomer().CT_Num, this.ordersActive);
        this.order$.next(order);
        this.ordersActive$.next(this.ordersActive);
    }
}
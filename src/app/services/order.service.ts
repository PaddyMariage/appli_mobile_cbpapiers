import {Injectable} from '@angular/core';
import {Order} from "../models/Order";
import {Storage} from "@ionic/storage";
import { F_COMPTET } from '../models/JSON/F_COMPTET';
import { UserService } from './user.service';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private order: Order;
    private orders: Order[] = [];

    constructor(private dataStorage : Storage,
                private userService : UserService) {
    }

    // transfère une order (utilise dans l'history)
    setOrder(order: Order) {
        this.order = order;
    }

    getOrder(): Order {
        return this.order;
    }

    getOrders(): Order[] {
        return this.orders;
    }

    // Permet d'initialiser la liste d'historique à partir du storage et renvoie les commmandes appartenant à un compte.
    initAndGetOrdersStorage() : Promise<Order[]> {
        this.orders = [];
        return this.dataStorage.ready().then(() => {
            return this.dataStorage.get('orders').then((orders) => {
                let ordersTotal : Order[] = JSON.parse(orders);
                let ordersAcc : Order[] = [];
                let account = this.userService.getActiveCustomer();
                ordersTotal.forEach((order) => {
                    if (order.customer.CT_Num == account.CT_Num) {
                        ordersAcc.push(order);
                    }
                })
                this.orders = ordersAcc ;
                return ordersAcc;
            });
        });
        
    }

    setOrders(orders: Order[]) {
        this.orders = orders;
    }

    addOrder(order) {
        this.orders.push(order);
        console.log(this.orders.length);
        this.dataStorage.set('orders', JSON.stringify(this.orders));
    }

    editOrder(order) {
        const objIndex = this.orders.findIndex((obj => obj.orderNumber == order.orderNumber));
        this.orders[objIndex] = order;
    }
}


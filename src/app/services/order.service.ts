import {Injectable} from '@angular/core';
import {Order} from "../models/Order";
import {Storage} from "@ionic/storage";
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

    isOrdersStorageEmpty() : Promise<boolean> {
        return this.dataStorage.ready().then(() => {
            return this.dataStorage.get('orders').then((val) => {
                let valueArray : Order[] = JSON.parse(val);
                // Si c'est faux c'est vide, sinon il y a une commande
                if (valueArray.length != 0) {
                    return false;
                }
                else
                    return true;
            }) 
        })
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

    // Ajoute la commande au tableau de commande et ajoute ce même tableau au local storage
    addOrder(order) {
        this.orders.push(order);
        console.log(this.orders.length);
        this.dataStorage.set('orders', JSON.stringify(this.orders));
    }

    editOrderStorage(order : Order) {
        // je récupérere le tableau de commande et je cherche l'inx de l'objet qui a le même numéro de commande qu'order
        this.dataStorage.get('orders').then((orders) => {
            let ordersTotal : Order[] = JSON.parse(orders);
            let i;
            ordersTotal.forEach((orderArray) => {
                if (order.orderNumber == orderArray.orderNumber)
                    i = ordersTotal.indexOf(orderArray);
                    console.log("Trouvé " + order.orderNumber);
            });
            // On supprime un élément à l'index i, puis on ajoute l'objet order a sa place
            ordersTotal.splice(i, 1);
            ordersTotal.push(order);
            // je réattribue le tableau avec l'objet modifié et je relance l'initialisation d'orders
            this.dataStorage.set('orders', JSON.stringify(ordersTotal)).then(() => {
                this.initAndGetOrdersStorage();
            });
        });
    }

    editOrder(order) {
        const objIndex = this.orders.findIndex((obj => obj.orderNumber == order.orderNumber));
        this.orders[objIndex] = order;
    }
}


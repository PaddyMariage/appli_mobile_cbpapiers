import {Injectable} from '@angular/core';
import {Order} from "../models/Order";
import {Storage} from "@ionic/storage";
import { UserService } from './user.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private order: Order;
    private ordersActive: Order[] = [];
    public order$ : BehaviorSubject<Order> = new BehaviorSubject<Order>(null);
    public ordersActive$ : BehaviorSubject<Order[]> = new BehaviorSubject<Order[]>(null);

    constructor(private dataStorage : Storage,
                private userService : UserService) {
    }

    // transfère une order (utilise dans l'history)
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

    deleteOrder(order : Order) {
        let ordersTotal : Order[];
        this.dataStorage.get('orders').then((orders) => {
            ordersTotal = JSON.parse(orders);
            let i = ordersTotal.indexOf(order);
            ordersTotal.splice(i, 1);
        }).then(() => {
            this.dataStorage.set('orders', JSON.stringify(ordersTotal));
            this.initAndGetOrdersStorage();
        });
    }

    isOrdersStorageEmpty() : Promise<boolean> {
        return this.dataStorage.ready().then(() => {
            return this.dataStorage.get('orders').then((val) => {
                let valueArray : Order[] = JSON.parse(val);
                console.log(valueArray);
                // Todo : même si c'est null ça rend false, savoir pourquoi
                // Si c'est faux il y au moins une commande, sinon c'est vide
                if (valueArray == null || valueArray == []) {
                    return true;
                }
                else
                    return false;
            }) 
        })
    }

    // Permet d'initialiser la liste d'historique à partir du storage et renvoie les commmandes appartenant à un compte.
    initAndGetOrdersStorage(){
        this.ordersActive = [];
        this.dataStorage.ready().then(() => {
            this.dataStorage.get('orders').then((orders) => {
                let ordersTotal : Order[] = JSON.parse(orders);
                let ordersAccount : Order[] = [];
                let activeAccount = this.userService.getActiveCustomer();
                ordersTotal.forEach((order) => {
                    if (order.customer.CT_Num == activeAccount.CT_Num) {
                        ordersAccount.push(order);
                    }
                });
                ordersAccount.sort((a,b) => (new Date(b.orderDate).valueOf() - new Date(a.orderDate).valueOf()));
                console.log(ordersAccount);
                this.setActiveOrders(ordersAccount);
            });
        });

    }

    // Vérifie si c'est vide, si c'est le cas on ajoute simplement. Si non, on recupere d'abord le tableau puis on add
    addOrder(order) {
        this.isOrdersStorageEmpty().then((boolean) => {
            if (!boolean) {
                let totalOrders : Order[];
                this.dataStorage.get('orders').then((valOrders) => {
                    totalOrders = JSON.parse(valOrders);
                    totalOrders.push(order);
                }).then(() => {
                    this.dataStorage.set('orders', JSON.stringify(totalOrders)).then(() => {
                        this.initAndGetOrdersStorage();
                    });
                })
            } else {
                this.ordersActive.push(order);
                this.dataStorage.set('orders', JSON.stringify(this.ordersActive));
            }
        })
        
    }

    editOrderStorage(order : Order) {
        // je récupérere le tableau de commande et je cherche l'index de l'objet qui a le même numéro de commande qu'order
        this.dataStorage.get('orders').then((orders) => {
            let ordersTotal : Order[] = JSON.parse(orders);
            let i;
            ordersTotal.forEach((orderArray) => {
                if (order.orderNumber == orderArray.orderNumber)
                    i = ordersTotal.indexOf(orderArray);
            });
            // On supprime un élément à l'index i, puis on ajoute l'objet order a sa place
            ordersTotal.splice(i, 1, order);

            // je réattribue le tableau avec l'objet modifié et je relance l'initialisation d'orders
            this.dataStorage.set('orders', JSON.stringify(ordersTotal)).then(() => {
                this.initAndGetOrdersStorage();
                this.setOrder(order);
            });
        });
    }

    /* Plus utile ?
    editOrder(order) {
        const objIndex = this.orders.findIndex((obj => obj.orderNumber == order.orderNumber));
        this.orders[objIndex] = order;
    }
    */
}


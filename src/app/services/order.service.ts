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
        this.dataStorage.get('orders' + this.userService.getActiveCustomer().CT_Num).then((orders) => {
            ordersTotal = JSON.parse(orders);
            let i = ordersTotal.indexOf(order);
            ordersTotal.splice(i, 1);
        }).then(() => {
            this.dataStorage.set('orders'+ this.userService.getActiveCustomer().CT_Num, JSON.stringify(ordersTotal));
            this.initAndGetOrdersStorage();
        });
    }

    isOrdersStorageEmpty() : Promise<boolean> {
        return this.dataStorage.ready().then(() => {
            return this.dataStorage.get('orders' + this.userService.getActiveCustomer().CT_Num).then((val) => {
                let valueArray : Order[] = JSON.parse(val);
                return valueArray == null || valueArray == [];
            }) 
        })
    }

    // Permet d'initialiser la liste d'historique à partir du storage et renvoie les commmandes appartenant à un compte.
    initAndGetOrdersStorage(){
        this.ordersActive = [];
        console.log('init orders');
        this.dataStorage.ready().then(() => {
            this.dataStorage.get('orders' + this.userService.getActiveCustomer().CT_Num).then((orders) => {
                if(orders != null) {
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
    addOrder(order) {
        this.isOrdersStorageEmpty().then((boolean) => {
            if (!boolean) {
                let totalOrders : Order[];
                this.dataStorage.get('orders' + this.userService.getActiveCustomer().CT_Num).then((valOrders) => {
                    totalOrders = JSON.parse(valOrders);
                    totalOrders.push(order);
                }).then(() => {
                    this.dataStorage.set('orders' + this.userService.getActiveCustomer().CT_Num, JSON.stringify(totalOrders)).then(() => {
                        this.initAndGetOrdersStorage();
                    });
                })
            } else {
                this.ordersActive.push(order);
                if(this.ordersActive.length > 20)
                    this.ordersActive.splice(this.ordersActive.length, 1);
                this.dataStorage.set('orders' + this.userService.getActiveCustomer().CT_Num, JSON.stringify(this.ordersActive));
            }
        })
        
    }

    editOrderStorage(order : Order) {
        // je récupérere le tableau de commande et je cherche l'index de l'objet qui a le même numéro de commande qu'order
        let found = false;
        let index = 0;
        while(!found && index < this.ordersActive.length){
            if(this.ordersActive[index].orderNumber == order.orderNumber){
                found = true;
                this.ordersActive.splice(index, 1, order);
            } else
                index++;
        }

        this.dataStorage.set('orders' + this.userService.getActiveCustomer().CT_Num, this.ordersActive);

        /*
        this.dataStorage.get('orders' + this.userService.getActiveCustomer().CT_Num).then((orders) => {
            let ordersTotal : Order[] = JSON.parse(orders);
            let i;
            ordersTotal.forEach((orderArray) => {
                if (order.orderNumber == orderArray.orderNumber)
                    i = ordersTotal.indexOf(orderArray);
            });
            // On supprime un élément à l'index i, puis on ajoute l'objet order a sa place
            ordersTotal.splice(i, 1, order);

            // je réattribue le tableau avec l'objet modifié et je relance l'initialisation d'orders
            this.dataStorage.set('orders'+ this.userService.getActiveCustomer().CT_Num, JSON.stringify(ordersTotal)).then(() => {
                this.initAndGetOrdersStorage();
                this.setOrder(order);
            });
        });
        */
    }

    /* Plus utile ?
    editOrder(order) {
        const objIndex = this.orders.findIndex((obj => obj.orderNumber == order.orderNumber));
        this.orders[objIndex] = order;
    }
    */
}


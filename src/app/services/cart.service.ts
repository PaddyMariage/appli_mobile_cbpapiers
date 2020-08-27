import {Injectable} from '@angular/core';
import {OrderLine} from '../models/OrderLine';
import {BehaviorSubject} from 'rxjs';
import {WarehouseRetService} from './warehouse-ret.service';
import {Order} from '../models/Order';

@Injectable({
    providedIn: 'root'
})
export class CartService {

    public cart$: BehaviorSubject<Order> = new BehaviorSubject<Order>(null);
    public orderLineList$: BehaviorSubject<OrderLine[]> = new BehaviorSubject<OrderLine[]>([]); // liste qui apparait sur la page article
    private cart: Order;
    private readonly initCart: Order;
    private orderLine: OrderLine;
    private orderLineList: OrderLine[] = [];
    private WHRetrieval: boolean;
    private finalTotal: number;
    private total: number;

    // transfère le montant total du cart (utilisé dans la modal ValidationCom)
    constructor(private warehouseRet: WarehouseRetService) {

        this.initCart = {
            orderNumber: null,
            orderLines: [],
            customer: null,
            orderDate: null
        };

        this.cart = this.initCart;
        this.cart$.next(this.initCart);

        this.warehouseRet.toggle$.subscribe((value) => {
                this.WHRetrieval = value;
                this.updateTotal();
            }
        );
    }

    getCart(): Order {
        return this.cart;
    }

    setCart(cart: Order) {
        this.cart = cart;
        this.updateTotal();
        this.cart$.next(this.cart);
    }

    updateCartInfos(orderNumber: string, dateOrder: Date) {
        this.cart.orderNumber = orderNumber;
        this.cart.orderDate = dateOrder;
        this.cart$.next(this.cart);
    }

    // remet le panier à l'inital = vidage de panier
    resetCart() {
        this.cart = this.initCart;
        this.setCart(this.initCart);
    }


    // permet d'initialiser la liste d'articles dans articlePage
    initOrderLinesList(orderLines: OrderLine[]) {
        this.orderLineList = orderLines;
        this.orderLineList$.next(orderLines);
    }

    // mise à jour de la liste d'article avec la bonne quantité : prend une orderline en particulier
    updateOrderLineFromList(orderLine: OrderLine, qty: number) {
        const index = this.orderLineList.indexOf(orderLine);
        this.orderLineList[index].quantity = qty;
        this.orderLineList$.next(this.orderLineList);

        // const index2 = this.cart.orderLines.indexOf(orderLine);
        // console.log('index à supprimer');
        // console.log(this.cart.orderLines.indexOf(orderLine));
        //
        // console.log('quantité à supprimer');
        // console.log(this.cart.orderLines[index2].quantity);
        //
        // if(this.cart.orderLines[index2].quantity === 0){
        //     console.log(this.cart.orderLines[index2]);
        //     this.cart.orderLines.splice(index2,1);
        //     // this.cart$.next(this.cart);
        // }
    }

    // mise à jour des quantités dans la liste des articles : prend toutes les orderlines du panier en paramètre
    setOrderLineList(orderLinesFromCart: OrderLine[]) {
        orderLinesFromCart.forEach(orderLine => {
            let index = 0;
            let found = false;
            while (!found && index < this.orderLineList.length) {
                if (orderLine.article.reference == this.orderLineList[index].article.reference) {
                    this.orderLineList[index].quantity = orderLine.quantity;
                    found = true;
                }
                index++;
            }
        });
        this.orderLineList$.next(this.orderLineList);
    }

    filterOrderLineList(orderLinesFiltered: OrderLine[]) {
        this.orderLineList$.next(orderLinesFiltered);
    }
    // remise à 0 des quantités dans la liste d'article
    resetQuantityOfOrderLineList() {
        this.orderLineList.forEach(orderLine => orderLine.quantity = 0);
        this.orderLineList$.next(this.orderLineList);
    }

    getOrderLineList(): OrderLine[] {
        return this.orderLineList;
    }

    setOrderLine(orderLine: OrderLine) {
        this.orderLine = orderLine;
    }

    getOrderLine(): OrderLine {
        return this.orderLine;
    }

    setTotal(total: number) {
        this.total = total;
    }

    getTotal() {
        return this.total;
    }

    setFinalTotal(finalTotal: number) {
        this.finalTotal = finalTotal;
    }

    getFinalTotal() {
        return this.finalTotal;
    }

    private updateTotal() {
        // Si le toggle est activé on applique la WHRetrieval
        this.total = 0;
        if (!this.WHRetrieval) {
            this.cart.orderLines.forEach(value => this.total += (value.article.unitPrice * value.quantity));
        } else {
            this.cart.orderLines.forEach(value => this.total += ((value.article.unitPrice * value.quantity) * 0.95));
        }
    }
}

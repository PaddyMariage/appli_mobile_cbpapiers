import {Component, OnDestroy, OnInit} from '@angular/core';
import {OrderService} from 'src/app/services/order.service';
import {OrderLine} from 'src/app/models/OrderLine';
import {ModalController} from '@ionic/angular';
import {OrderValidationPage} from '../order-validation/order-validation.page';
import {WarehouseRetService} from '../../services/warehouse-ret.service';
import {CartService} from '../../services/cart.service';
import {Subscription} from 'rxjs';
import {Order} from '../../models/Order';


@Component({
    selector: 'app-panier',
    templateUrl: './cart.page.html',
    styleUrls: ['./cart.page.scss'],
})
// dans le cas d'un "can't bind" to ngFor", ajouter CartPage au module qui la déclare dans declarations & entryComponents
export class CartPage implements OnInit, OnDestroy {

    possibleQuantities: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    cart: Order;
    total: number;
    warehouseRetrieval: boolean;
    subscriptionToCart: Subscription;
    subscriptionToWHRetrieval: Subscription;
    // orderLineList: OrderLine[];
    shippingPrice = 20;
    finalTotal: number;
    statusShipping: boolean;

    constructor(private orderService: OrderService,
                private modalController: ModalController,
                private warehouseRetService: WarehouseRetService,
                private cartService: CartService) {
    }

    ngOnInit() {
        // on subscribe aux données (ici un tableau de ligne de commande du cart), dès qu'un changement est detecté on les récupère
        this.subscriptionToCart = this.cartService.cart$.subscribe(data => {
                this.cart = data;
                this.total = this.cartService.getTotal();
                this.updateStatusShipping();
                this.setFinalTotal();
                this.updateStatusShipping();
            }
        );
        this.subscriptionToWHRetrieval = this.warehouseRetService.toggle$.subscribe((status) => {
            this.warehouseRetrieval = status;
            this.total = this.cartService.getTotal();
            this.setFinalTotal();
            this.updateStatusShipping();
        });

    }

    // pour fermer la modal de manière explicite par un bouton
    // sinon si on clique à côté de la modal ça appel modalController.dismiss() tout seul
    onDismiss() {
        this.modalController.dismiss();
    }

    // appelé quand la modal est fermée par modelController.dismiss()
    // on supprime les souscriptions aux observables
    ngOnDestroy() {
        this.subscriptionToCart.unsubscribe();
        this.subscriptionToWHRetrieval.unsubscribe();
    }

    //supprime une orderline du panier
    deleteLine(orderLine: OrderLine) {
        this.cartService.updateOrderLineFromList(orderLine, 0);
        // if (this.cart.orderLines.length === 0 ) {
        //     this.onDismiss();
        // }
        this.cartService.setCart(this.cart);
    }

    deleteAll() {
        // this.cartService.resetCartOrderLines();
        this.cartService.resetCart();
        this.cartService.resetQuantityOfOrderLineList();
        this.onDismiss();
    }


    // toggle le warehouseRetrieval on-off
    toggled() {
        this.warehouseRetService.setStatus(!this.warehouseRetService.getStatus());
    }

    async createValidationOrder() {
        this.cartService.setFinalTotal(this.finalTotal);
        this.warehouseRetService.setStatusShipping(this.statusShipping);
        this.cartService.setCart(this.cart);
        this.modalController.dismiss();
        const modal = await this.modalController.create({
            component: OrderValidationPage,
            cssClass: 'modal-pop',
            backdropDismiss: true
        });
        return await modal.present();
    }

    // it's the final totaaaal (total avec shipp s'il ya)
    setFinalTotal() {
        if (!this.warehouseRetrieval && this.total < 250) {
            this.finalTotal = this.total + 20;
        } else {
            this.finalTotal = this.total;
        }
    }

    updateStatusShipping() {
        this.statusShipping = !(this.warehouseRetrieval || this.total >= 250);
    }

    updateCart($event: any, line: OrderLine) {
        line.quantity = $event.target.value;
    }
}

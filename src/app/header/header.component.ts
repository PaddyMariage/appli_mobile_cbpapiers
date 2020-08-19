import {Component, OnInit} from '@angular/core';
import {ModalController, NavController} from '@ionic/angular';
import {OrderService} from '../services/order.service';
import {CartPage} from '../pages/cart/cart.page';
import {UserService} from '../services/user.service';
import {WarehouseRetService} from '../services/warehouse-ret.service';
import {CartService} from '../services/cart.service';
import {Order} from '../models/Order';
import { cloneDeep } from 'lodash';
import {F_COMPTET} from "../models/JSON/F_COMPTET";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

    cart: Order;
    total = 0;
    WHRetrieval = false;
    customer: F_COMPTET = null;

    constructor(private modalController: ModalController,
                private navCtrl: NavController,
                private orderService: OrderService,
                private cartService: CartService,
                private userService: UserService,
                private warehouseRetService: WarehouseRetService
    ) {}

    ngOnInit() {
        // on subscribe à toute nouvelles données du cart
        this.cartService.cart$.subscribe((data) => {
            this.cart = data;
            this.total = this.cartService.getTotal();
        });

        // on subscribe à tout nouveau changement du customer actif
        this.userService.activeCustomer$.subscribe((data) => {
            this.customer = data;
            this.cart.customer = data;
        });

        // on subscribe à tout nouveau changement du status du toogle
        this.warehouseRetService.toggle$.subscribe((status) => {
            this.WHRetrieval = status;
            this.total = this.cartService.getTotal();
        });
    }


    // cree une modale qui represente le cart
    async createCart() {
        const modal = await this.modalController.create({
            component: CartPage,
            cssClass: 'modal-panier',
            backdropDismiss: true,
        });
        return await modal.present();
    }

    // permet d'avancer vers une route selectionné. L'avantage c'est que cela créer une animation
    // adéquate (fondu "avant" ou "arrière" d'un back button). Une des nombreuses manière de naviguer
    async goToSettings() {
        console.log(this.userService.getCustomerAccounts());
        this.navCtrl.navigateForward('acc-choice');
    }

    // probleme de synchronisation au depart
    // solution ci-dessous, permet de fix le ion-toggle, erreur de synchro entre cart & header
    // https://medium.com/@aleksandarmitrev/ionic-toggle-asynchronous-change-challenge-7e7cbdd50cb7
    toggle($event: any) {
        // méthodes pour fix l'erreur de synchro qui pop
        $event.stopImmediatePropagation();
        $event.stopPropagation();
        $event.preventDefault();
        // le setTimeout fait parti des méthodes pour fix l'erreur de synchro.
        // on set le boolean dans le BehaviorSubject à la valeur inverse
        // s'il était à true au toggle -> on le met à false
        // Et inversement s'il était à false au toggle -> on le met à true;
        setTimeout(() => this.warehouseRetService.setStatus(!this.WHRetrieval));

    }
}


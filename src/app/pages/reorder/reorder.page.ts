import {Component, OnInit} from '@angular/core';
import {OrderService} from "../../services/order.service";
import {Order} from "../../models/Order";

import {cloneDeep} from 'lodash';
import {CartService} from "../../services/cart.service";
import { ToastController } from '@ionic/angular';

@Component({
    selector: 'app-recommande',
    templateUrl: './reorder.page.html',
    styleUrls: ['./reorder.page.scss'],
})
export class ReorderPage implements OnInit {
    order: Order;
    total: number = 0;
    warehouseRetrieval: boolean = false;

    constructor(private orderService: OrderService,
                private cartService: CartService,
                private toastController : ToastController) {
    }

    ngOnInit() {
        this.order = this.orderService.getOrder();
        this.updateTotal();
    }

    toggled() {
        this.warehouseRetrieval = !this.warehouseRetrieval;
        this.updateTotal();
    }


    // met a jour le total du cart en fonction des articles & de leur quantite & du discount, selon leur finalPrice
    private updateTotal() {
        // Si le toggle est activé on applique la remise
        this.total = 0;
        if (!this.warehouseRetrieval)
            this.order.orderLines.forEach(value => this.total += (value.article.finalPrice * value.quantity));
        else
            this.order.orderLines.forEach(value => this.total += ((value.article.finalPrice * value.quantity) * 0.95));
        if (this.total < 250 && !this.warehouseRetrieval)
            this.total += 20;
    }


    // met a jour le cart dans le service
    updateCart() {

        this.toastClick();
        // fait un deep clone des lignes de la commande
        const newCart = cloneDeep(this.order.orderLines);
        // on met à jour le panier avec le clone
        this.cartService.setCart(newCart);
    }

    // génère un toast pour indiquer le transfert de panier
    async toastClick() {
        const toast = await this.toastController.create({
          color: 'white',
          duration: 3000,
          message: 'Commande bien transférée!'
        });
  
        await toast.present();
      }
}

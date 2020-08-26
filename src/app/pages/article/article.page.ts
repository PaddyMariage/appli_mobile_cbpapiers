import {Component, OnDestroy, OnInit} from '@angular/core';
import {LoadingController, ModalController} from '@ionic/angular';
import {SingleArticlePage} from '../single-article/single-article.page';
import {OrderLine} from 'src/app/models/OrderLine';
import {UserService} from 'src/app/services/user.service';
import {CartService} from '../../services/cart.service';
import {ArticleService} from '../../services/article.service';
import {Order} from "../../models/Order";
import {F_COMPTET} from "../../models/JSON/F_COMPTET";
import {Storage} from "@ionic/storage";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-articles',
    templateUrl: './article.page.html',
    styleUrls: ['./article.page.scss'],
})
export class ArticlePage implements OnInit, OnDestroy {

    possibleQuantities: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    cart: Order;
    orderLineList: OrderLine[] = [];
    orderLineBackup: OrderLine[] = [];
    totalQuantity: number;
    customer: F_COMPTET;
    loading: HTMLIonLoadingElement;
    cartSub: Subscription;
    orderLineSub: Subscription;
    activeCustomerSub: Subscription;

    constructor(private modalController: ModalController,
                private cartService: CartService,
                private userService: UserService,
                private articleService: ArticleService,
                private storage: Storage,
                private loadingController: LoadingController) {
    }

    ngOnInit(): void {
        this.cartSub = this.cartService.cart$.subscribe(data => {
            this.cart = data;
            this.totalQuantity = data.orderLines.length;
        });

        this.orderLineSub = this.cartService.orderLineList$.subscribe(
            (liste) => {
                this.orderLineList = liste;
            }
        );

        this.activeCustomerSub = this.userService.activeCustomer$.subscribe(
            customer => {
                // on ne refresh pas si c'est déjà celui présent dans la page
                if (this.customer == null || this.customer.CT_Num != customer.CT_Num) {
                    this.orderLineList = [];
                    this.customer = customer;
                    this.initTopF_ARTICLE();
                }
            }
        );

        this.presentLoading();
    }

    async presentLoading() {
        this.loading = await this.loadingController.create({
            spinner: 'lines',
            message: 'Veuillez patienter le temps que je prépare votre liste de produits...',
            translucent: true,
        });
        await this.loading.present();
    }

    dismissLoading() {
        this.loadingController.dismiss(this);
    }

    private async initTopF_ARTICLE() {
        await this.articleService.getDocLignes(this.customer.CT_Num).then(
            (orderLines: OrderLine[]) => this.cartService.initOrderLinesList(orderLines)
        )
            .catch(error => console.log(error))
            .finally(() => {
                console.log(this.orderLineList);
                this.initAllInfos(this.orderLineList)
            });
    }

    private async initAllInfos(orderLineList: OrderLine[]) {
        console.log('in initAllInfos()');
        await this.articleService.getArtClients(orderLineList, this.customer.CT_Num).then(
            (orderLineList_Updated: OrderLine[]) => this.orderLineList = orderLineList_Updated
        ).finally(() => {
            this.initAllPrices(this.orderLineList);
        });

    }

    private async initAllPrices(orderLineList: OrderLine[]) {
        console.log('in initAllPrices()');
        await this.articleService.getF_ARTICLE(orderLineList).then(
            (orderLineList_Final: OrderLine[]) => this.orderLineList = orderLineList_Final
        ).finally(() => {
            console.log(this.orderLineList);
            this.cartService.initOrderLinesList(this.orderLineList);
            this.dismissLoading();
        });
    }


    // retourne un backup d'orderLineList générée en initialisation de page.
    // l'intérêt est d'avoir une liste clean en backup qu'on envoie à la fonction filtre
    getOrderLines() {
        return this.orderLineBackup;
    }

    // méthode pour la searchbar de ionic.
    getArticleSearched(ev: any) {

        // ici on récupère notre backup qu'on pourra manipuler dans un objet différent.
        let orderLines = this.getOrderLines();
        // set la valeur de l'input de la searchbar dans "val". On indique que c'est un input html
        const val = (ev.target as HTMLInputElement).value;

        // si rien n'est mis on affiche tout, sinon on filtre avec ce qui a été inséré
        if (val && val.trim() !== '') {

            // on manipule et filtre l'objet
            orderLines = orderLines.filter((orderLine) => {
                return (orderLine.article.reference.toLowerCase().indexOf(val.toLowerCase()) > -1 ||
                    orderLine.article.label.toLowerCase().indexOf(val.toLowerCase()) > -1);
            });
        }

        // on l'envoie à l'observable pour que la page se mette à jour
        this.cartService.setOrderLineList(orderLines);
    }

    async createOrderLineDetails(orderLine: OrderLine) {

        const modal = await this.modalController.create({
            component: SingleArticlePage,
            cssClass: 'modal-article',
            backdropDismiss: true,
            componentProps: {
                orderLine
            }
        });
        return await modal.present();

    }

    // Dés qu'une quantité est selectionnée pour un article, la méthode met à jour le panier et envoie l'information au cartservice
    // on interprète le fait que c'est une suppression ou un ajout ou une mise à jour
    onChangeOrderLine($event: any, orderLine: OrderLine) {

        // récupération de la quantité modifiée
        const qty = $event.target.value;

        // récupération de la position de l'article modifié dans le panier
        const index = this.cart.orderLines.indexOf(orderLine);

        // 1er if : on checke si il s'agit d'une suppression
        // l'article est dans le panier : quantité = 0 et on supprime l'article du panier
        if (qty == 0 && this.cart.orderLines.length !== 0 && index !== -1)
            this.cart.orderLines.splice(index, 1);

        // on met à jour la quantité d'article d'un article déjà présent dans le panier (mais pas à supprimer : qté >0)
        else if (index !== -1) {
            orderLine.quantity = qty;
            this.cart.orderLines[index] = orderLine;

            // dernier cas : dans le cas d'un article qui n'est pas dans le panier (car index= -1 = article non trouvé)
            // on set la nouvelle quantité et on ajoute le nouvel article au panier
        } else {
            orderLine.quantity = qty;
            this.cart.orderLines.push(orderLine);
        }

        // on met à jour le nouveau panier dans le service
        this.cartService.setCart(this.cart);
    }

    ngOnDestroy() {
        this.cartSub.unsubscribe();
        this.orderLineSub.unsubscribe();
        this.activeCustomerSub.unsubscribe();
    }
}


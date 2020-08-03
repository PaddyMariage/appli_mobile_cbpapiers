import {Component, OnInit} from '@angular/core';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import {ModalController, Platform} from '@ionic/angular';

import {File} from '@ionic-native/file/ngx';
import {FileOpener} from '@ionic-native/file-opener/ngx';
import {EmailComposer} from '@ionic-native/email-composer/ngx';

import {CartService} from '../../services/cart.service';
import {WarehouseRetService} from '../../services/warehouse-ret.service';
import {UserService} from '../../services/user.service';
import {OrderLine} from '../../models/OrderLine';
import {OrderService} from '../../services/order.service';
import {Order} from '../../models/Order';
import { cloneDeep } from 'lodash';
import {GenerateIDService} from '../../services/generate-id.service';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: 'app-validation-com',
    templateUrl: './order-validation.page.html',
    styleUrls: ['./order-validation.page.scss'],
})
export class OrderValidationPage implements OnInit {

    finalTotal: number;

    pdfObj = null;
    statusShipping: boolean;
    order: Order;

    // Erreur de dépendance circulaire dans la classe, si on enleve file, fileopener et emailc, l'erreur disparait
    constructor(private plt: Platform,
                private file: File,
                private fileOpener: FileOpener,
                private emailComposer: EmailComposer,
                private cartService: CartService,
                private warehouseRetService: WarehouseRetService,
                private userService: UserService,
                private orderService: OrderService,
                private modalController: ModalController,
                private generateIdService: GenerateIDService) {
    }

    ngOnInit() {
        this.order = this.cartService.getCart();
        this.finalTotal = this.cartService.getFinalTotal();
        this.statusShipping = this.warehouseRetService.getStatusShipping();
    }


    // permet d'indiquer si y a un retrait entrepôt ou non en fonction du statut du toogle du retrait entrepôt
    isWarehouseRet() {
        return this.warehouseRetService.getStatus() ? 'OUI' : 'NON';
    }

    shipping(){
        return this.statusShipping ? '20 €' : 'gratuite';
    }

    // construction du header du tableau du pdf = titres des colonnes du tableau
    header = [
        {text: 'Reference article', style: 'tableHeader', alignment: 'center'},
        {text: 'Quantité', style: 'tableHeader', alignment: 'center'},
        {text: 'Prix', style: 'tableHeader', alignment: 'center'}
    ];

    // on initialise les lignes du tableau avec le header
    myBody = [this.header];

    // construction des lignes du tableau : pour chaque orderline récupérée du panier
    // on ajoute cette orderline dans une ligne du tableau avec les éléments dont on a besoin :
    // ici reference de l'article, quantité et prix final
    // l'array myBody est donc incrémenté de nouvelles données
    constructBody() {
        for (const orderline of this.order.orderLines) {
            // @ts-ignore
            this.myBody.push([`${orderline.article.reference}`, `${orderline.quantity}`, `${orderline.article.finalPrice * orderline.quantity + '€'}`]);
        }
        return this.myBody;
    }

    checkEditOrderOrNot(){
        if (this.order.orderNumber == null){
            this.order =
                {
                    // numéro de commande généré dans le service generateID
                    orderNumber: this.generateIdService.generate(),
                    orderDate: new Date(),
                    customer : this.userService.getActiveCustomer(),
                    orderLines: this.cartService.getCart().orderLines
                };
            this.sendPdf();
        } else {
            this.order = this.cartService.getCart();
            this.sendPdfEdit();
        }
    }

    sendPdf() {
        // enregistrement de la commande réalisée dans le tableau des commandes de orderService
        let docDefinition = {
            content: [
                {text: 'CBPAPIERS', style: 'header'},
                // impression de la date au format dd/mm/yyyy hh'h'mm
                {
                    text: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
                    alignment: 'right'
                },
                {text: 'Commande : ' , style: 'subheader'},
                {text: 'Ref client : ' + this.userService.getActiveCustomer().id},
                {text: this.userService.getActiveCustomer().name},
                {text: this.userService.getActiveCustomer().address},

                // c'est ici qu'on construit le tableau dans le pdf :
                // on indique le nombre de colonnes et on injecte l'array myBody construit dans la méthode constructBody()
                {
                    style: 'tableExample',
                    table: {
                        widths: ['*', '*', '*'],
                        body: this.constructBody()
                    }
                },
                {text : 'Livraison : ' + this.shipping(), alignment: 'right'},
                {
                    text: 'Total HT : ' + this.finalTotal + ' €', alignment: 'right'
                },
                {
                    text: 'Retrait entrepôt : ' + this.isWarehouseRet(), alignment: 'right'
                }
            ],
            styles: {
                subheader: {
                    fontSize: 16,
                    bold: true,
                    margin: [0, 10, 0, 5]
                },
                tableExample: {
                    margin: [0, 5, 0, 15]
                },
                tableHeader: {
                    bold: true,
                    fontSize: 13,
                    color: 'black'
                }
            },
            defaultStyle: {
                alignment: 'justify'
            }
        };
        this.pdfObj = pdfMake.createPdf(docDefinition);
        this.downloadPdf();
        this.sendMail();
        
        const ORDER_HISTORY = cloneDeep(this.order);
        this.orderService.addOrder(ORDER_HISTORY);

        //on reinitialise les orderlines de panier pour le remettre à 0
        this.deleteAll(this.order.orderLines);
        
    }

    sendPdfEdit() {
        // // enregistrement de la commande réalisée dans le tableau des commandes de orderService
        // let docDefinition = {
        //     content: [
        //         {text: 'CBPAPIERS', style: 'header'},
        //         // impression de la date au format dd/mm/yyyy hh'h'mm
        //         {
        //             text: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
        //             alignment: 'right'
        //         },
        //         {text: 'ATTENTION Commande : ' + this.cartService.getCart().orderNumber + ' MODIFIEE' , style: 'subheader'},
        //         {text: 'Ref client : ' + this.userService.getActiveCustomer().id},
        //         {text: this.userService.getActiveCustomer().name},
        //         {text: this.userService.getActiveCustomer().address},
        //
        //         // c'est ici qu'on construit le tableau dans le pdf :
        //         // on indique le nombre de colonnes et on injecte l'array myBody construit dans la méthode constructBody()
        //         {
        //             style: 'tableExample',
        //             table: {
        //                 widths: ['*', '*', '*'],
        //                 body: this.constructBody()
        //             }
        //         },
        //         {text : 'Livraison : ' + this.shipping(), alignment: 'right'},
        //         {
        //             text: 'Total HT : ' + this.finalTotal + ' €', alignment: 'right'
        //         },
        //         {
        //             text: 'Retrait entrepôt : ' + this.isWarehouseRet(), alignment: 'right'
        //         }
        //     ],
        //     styles: {
        //         subheader: {
        //             fontSize: 16,
        //             bold: true,
        //             margin: [0, 10, 0, 5]
        //         },
        //         tableExample: {
        //             margin: [0, 5, 0, 15]
        //         },
        //         tableHeader: {
        //             bold: true,
        //             fontSize: 13,
        //             color: 'black'
        //         }
        //     },
        //     defaultStyle: {
        //         alignment: 'justify'
        //     }
        // };
        //
        // this.pdfObj = pdfMake.createPdf(docDefinition);
        // this.downloadPdf();
        // this.sendMail();
        //
        // const ORDER_HISTORY = cloneDeep(this.order);
        // this.orderService.editOrder(ORDER_HISTORY);
        //

        //on reinitialise les orderlines de panier pour le remettre à 0
        this.deleteAll(this.order.orderLines);

    }

    // permet d'enregistrer le pdf dans le data Directory de l'application
    downloadPdf() {
        if (this.plt.is('cordova')) {
            this.pdfObj.getBuffer((buffer) => {
                // tslint:disable-next-line:prefer-const
                let blob = new Blob([buffer], {type: 'application/pdf'});

                // Save the PDF to the data Directory of our App
                this.file.writeFile(this.file.dataDirectory, 'commande.pdf', blob, {replace: true}).then(fileEntry => {
                    //  à enlever !  je laisse juste pour les tests sur pc
                    // this.fileOpener.open(this.file.dataDirectory + 'myletter.pdf', 'application/pdf');
                });
            });
        } else {
            // On a browser simply use download!
            this.pdfObj.download();
        }

    }

    // permet de formater le mail à envoyer et demande à ouvrir le mail sur le telephone + ajoute le pdf en pièce jointe
    sendMail() {
        const email = {
            // to: 'contact@cbpapiers.com',
            to: 'adrien.fek@gmail.com',
            cc: 'justine.gracia@gmail.com',
            attachments: [
                this.file.dataDirectory + 'commande.pdf'
            ],
            subject: ' REFCLIENT : ' + this.userService.getActiveCustomer().id,
            body: 'Ci-joint le récapitulatif de la commande',
            isHtml: true
        };
        this.emailComposer.open(email);

    }

    // fermeture de la modal après envoi commande
    onDismiss(){
        this.modalController.dismiss();
    }

    // remise à 0 du panier et des quantités d'article sélectionnées après envoi commande
    deleteAll(orderlines: OrderLine[]) {
        // faut fix ca ! ! ! ca efface tout sinon

        orderlines.forEach(
            (orderLine) => {
                orderLine.quantity = 0;
            }
        );

        this.cartService.resetCart();
        this.onDismiss();
    }

}


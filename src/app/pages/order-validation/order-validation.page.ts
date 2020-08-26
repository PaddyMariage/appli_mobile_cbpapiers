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
import {cloneDeep} from 'lodash';
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
    order: Order;
    statusShipping: boolean;
    orderNumberWasNull: boolean;
    // construction du header du tableau du pdf = titres des colonnes du tableau
    header = [
        {text: 'Reference article', style: 'tableHeader', alignment: 'center'},
        {text: 'Quantité', style: 'tableHeader', alignment: 'center'},
        {text: 'Prix', style: 'tableHeader', alignment: 'center'}
    ];
    // on initialise les lignes du tableau avec le header
    myBody = [this.header];

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

    shipping() {
        return this.statusShipping ? '20 €' : 'gratuite';
    }

    // construction des lignes du tableau : pour chaque orderline récupérée du panier
    // on ajoute cette orderline dans une ligne du tableau avec les éléments dont on a besoin :
    // ici reference de l'article, quantité et prix final

    // l'array myBody est donc incrémenté de nouvelles données
    constructBody() {
        for (const orderline of this.order.orderLines) {
            // @ts-ignore
            this.myBody.push([orderline.article.reference, orderline.quantity, Number(orderline.article.unitPrice * orderline.quantity).toFixed(2) + '€']);
        }
        return this.myBody;
    }

    sendPdf() {
        const docDefinitionPart1 = [
            {text: 'CBPAPIERS', style: 'header'},
            // impression de la date au format dd/mm/yyyy hh'h'mm
            {
                text: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
                alignment: 'right'
            }
        ];

        let docDefinitionPart2;
        if (this.order.orderNumber == null) {
            this.orderNumberWasNull = true;
            this.order.orderNumber = this.generateIdService.generate();
            this.order.orderDate = new Date();

            docDefinitionPart2 = [
                {text: 'Commande n° : ' + this.order.orderNumber, style: 'subheader'},
                {text: 'Ref client : ' + this.userService.getActiveCustomer().CT_Num},
                {text: this.userService.getActiveCustomer().CT_Intitule},
                {text: this.userService.getActiveCustomer().CT_Adresse},
                {text: this.userService.getActiveCustomer().CT_CodePostal + ' ' + this.userService.getActiveCustomer().CT_Ville},
                {text: this.userService.getActiveCustomer().CT_Pays}
            ];

        } else {
            docDefinitionPart2 = [
                {
                    text: 'ATTENTION Commande n° ' + this.cartService.getCart().orderNumber
                        + ' du ' + new Date(this.cartService.getCart().orderDate).toLocaleDateString() +
                        ' ' + new Date(this.cartService.getCart().orderDate).toLocaleTimeString()
                        + ' MODIFIEE', style: 'subheader'
                },
                {text: 'Ref client : ' + this.userService.getActiveCustomer().CT_Num},
                {text: this.userService.getActiveCustomer().CT_Intitule},
                {text: this.userService.getActiveCustomer().CT_Adresse},
                {text: this.userService.getActiveCustomer().CT_CodePostal + ' ' + this.userService.getActiveCustomer().CT_Ville},
                {text: this.userService.getActiveCustomer().CT_Pays}
            ];
        }

        // c'est ici qu'on construit le tableau dans le pdf :
        // on indique le nombre de colonnes et on injecte l'array myBody construit dans la méthode constructBody()
        const docDefinitionPart3 = [
            {
                style: 'tableExample',
                table: {
                    widths: ['*', '*', '*'],
                    body: this.constructBody()
                }
            },
            {text: 'Livraison : ' + this.shipping(), alignment: 'right'},
            {
                text: 'Total HT : ' + Number(this.finalTotal).toFixed(2) + ' €', alignment: 'right'
            },
            {
                text: 'Retrait entrepôt : ' + this.isWarehouseRet(), alignment: 'right'
            }
        ];

        const docDefinition = {
            content: [docDefinitionPart1, docDefinitionPart2, docDefinitionPart3],
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

        if (this.orderNumberWasNull)
            this.orderService.addOrder(ORDER_HISTORY);
        else
            this.orderService.editOrderStorage(ORDER_HISTORY);

        // on reinitialise les orderlines de panier pour le remettre à 0
        this.deleteAll(this.order.orderLines);
        // on set le orderNumber à null car sinon lors des prochaines commandes il va encore modifier la dernière
        this.cartService.getCart().orderNumber = null;
    }

    // permet d'enregistrer le pdf dans le data Directory de l'application
    downloadPdf() {
        if (this.plt.is('cordova')) {
            this.pdfObj.getBuffer((buffer) => {
                // tslint:disable-next-line:prefer-const
                let blob = new Blob([buffer], {type: 'application/pdf'});

                // Save the PDF to the data Directory of our App
                this.file.writeFile(this.file.dataDirectory, 'commande.pdf', blob, {replace: true});
            });
        } else {
            // On a browser simply use download!
            this.pdfObj.download();
        }

    }

    // permet de formater le mail à envoyer et demande à ouvrir le mail sur le telephone + ajoute le pdf en pièce jointe
    sendMail() {
        let email;
        if (this.orderNumberWasNull) {
            email = {
                to: 'commandemobile@cbpapiers.com',
                attachments: [
                    this.file.dataDirectory + 'commande.pdf'
                ],
                subject: 'Nouvelle commande n° ' + this.order.orderNumber + ' | REFCLIENT : ' + this.userService.getActiveCustomer().CT_Num,
                body: 'Ci-joint le récapitulatif de la commande',
                isHtml: true
            };
        } else {
            email = {
                to: 'commandemobile@cbpapiers.com',
                attachments: [
                    this.file.dataDirectory + 'commande.pdf'
                ],
                subject: 'Modification commande n° ' + this.order.orderNumber + ' | REFCLIENT : ' + this.userService.getActiveCustomer().CT_Num,
                body: 'Ci-joint le récapitulatif de la commande modifiée',
                isHtml: true
            };
        }
        this.emailComposer.open(email);

    }

    //fermeture de la modal après envoi commande
    onDismiss() {
        this.modalController.dismiss();
    }

    // remise à 0 du panier et des quantités d'article sélectionnées après envoi commande
    deleteAll(orderlines: OrderLine[]) {
        orderlines.forEach(
            (orderLine) => {
                orderLine.quantity = 0;
            }
        );

        this.cartService.resetCart();
        this.warehouseRetService.setStatus(false);
        this.onDismiss();
    }

}

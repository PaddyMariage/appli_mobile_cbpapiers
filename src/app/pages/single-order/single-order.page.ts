import {Component, OnInit} from '@angular/core';
import {Order} from '../../models/Order';
import {OrderService} from '../../services/order.service';
import {AlertController, AnimationController, ModalController, NavController, Platform, ToastController} from '@ionic/angular';
import { cloneDeep } from 'lodash';
import {CartService} from '../../services/cart.service';

import {File} from '@ionic-native/file/ngx';
import {FileOpener} from '@ionic-native/file-opener/ngx';
import {EmailComposer} from '@ionic-native/email-composer/ngx';
import {UserService} from '../../services/user.service';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import {ContactPage} from '../contact/contact.page';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: 'app-single-order',
    templateUrl: './single-order.page.html',
    styleUrls: ['./single-order.page.scss'],
})
export class SingleOrderPage implements OnInit {

    order: Order;
    orders : Order[] = []
    total = 0;
    canEdit: boolean;
    pdfObj = null;
    deadline: Date;

    constructor(private orderService: OrderService,
                private cartService: CartService,
                private alertController: AlertController,
                private navController: NavController,
                private toastController: ToastController,
                private plt: Platform,
                private file: File,
                private fileOpener: FileOpener,
                private emailComposer: EmailComposer,
                private userService: UserService,
                public modalController: ModalController,
                public animationCtrl: AnimationController) {
    }

    ngOnInit(): void {
        this.order = this.orderService.getOrder();
        this.orders = this.orderService.getOrders();
        this.total = 0;
        this.order.orderLines.forEach(value => this.total += (value.article.unitPrice * value.quantity));
        this.calculateDeadLine();
        this.calculateElapsedTime();
    }

    // méthode permettant de calculer la date limite pour pouvoir encore éditer une commande
    calculateDeadLine() {
        // le new date est imporant car sinon orderDate change aussi
        this.deadline = new Date(this.order.orderDate);
        // d'apres le CC la deadline est de 3 heures apres l'heure de commande
        this.deadline.setHours(this.deadline.getHours() + 3);
        // on compare l'heure actuelle à la deadline
        // si on a dépassé la deadline alors on peut plsu éditer la commande
        if (new Date() < this.deadline) {
            this.canEdit = true;
        }
    }

    // permet de calculer le temps restant à afficher avant de ne plus pouvoir éditer ou annuler une commande
        calculateElapsedTime(){
            const timeStart = new Date().getTime();
            const timeEnd = new Date(this.deadline).getTime();
            const hourDiff = timeEnd - timeStart; //in ms
            const minDiff = Math.floor(hourDiff / 60 / 1000); //in minutes
            const hDiff = hourDiff / 3600 / 1000; //in hours
            const humanReadable = {
                hours : null,
                minutes : null
            };
            humanReadable.hours = Math.floor(hDiff);
            humanReadable.minutes = minDiff - 60 * humanReadable.hours;
            return humanReadable;
        }


    async alertConfirm() {
        const alert = await this.alertController.create({
            header: 'Annulation d\'une commande',
            message: 'Êtes-vous certain de vouloir annuler cette commande ?',
            buttons: [
                {
                    text: 'Non',
                    // cssClass: 'secondary',
                    role: 'cancel',
                    handler: () => {
                    }
                }, {
                    text: 'Oui',
                    handler: () => {
                        this.sendCancel();
                    }
                }
            ]
        });
        await alert.present();
    }
    // todo : supprimer la commande du storage mais pas toucher a l'appli comme ça ça sera affiché comme annulé mais
    // elle ne sera plus la une fois l'appli fermé/rouverte.
    private sendCancel() {
        this.createPdf();
        this.sendMail();
        this.orderService.getOrder().isCancelled = true;
        this.navController.navigateBack(['/nav/history']);

    }

    // méthode appelée lorsqu'on veut recommander à partir de la commande (ajout des articles de la commande dans le panier)
    reorder() {
        const newCart = cloneDeep(this.order);
        // on met l'orderNumber du panier à null car on va refaire une nouvelle commande et non une édition de la commande
        newCart.orderNumber = null;
        // on met à jour les lignes du panier avec les lignes du clone de la commande
        this.cartService.setOrderLineList(newCart.orderLines);
        this.navController.navigateBack(['/nav/article']);
    }

    editOrder() {
        // création du toast
        // this.toastClick();
        // fait un deep clone des lignes de la commande
        const newCart = cloneDeep(this.order);
        // on met à jour les lignes du panier avec les lignes du clone de la commande
        this.cartService.setOrderLineList(newCart.orderLines);
        // on envoie les informations sur la commande dans le cartService afin qu'il sache qu'il s'agit d'une édition de commande
        this.cartService.updateCartInfos(newCart.orderNumber, newCart.orderDate);
        this.navController.navigateBack(['/nav/history']);
        this.navController.navigateBack(['/nav/article']);
    }

    // génère un toast pour indiquer le transfert de panier
    async toastClick() {
        const toast = await this.toastController.create({
          color: 'green',
          position: 'top',
          duration: 3000,
          message: 'Commande bien transférée!'
        });

        await toast.present();
      }

      createPdf(){
        const docDefinition = {
              content: [
                  {text: 'CBPAPIERS', style: 'header'},
                  // impression de la date au format dd/mm/yyyy hh'h'mm
                  {
                      text: new Date().toLocaleDateString() + ' '
                          + new Date().toLocaleTimeString(),
                      alignment: 'right'
                  },
                  {text: 'Commande du : ' + this.order.orderDate.toLocaleDateString() + ' '
                          + this.order.orderDate.toLocaleTimeString(), style: 'subheader'},
                  {text: 'Ref client : ' + this.userService.getActiveCustomer().CT_Num},
                  {text: this.userService.getActiveCustomer().CT_Intitule},
                  {text: this.userService.getActiveCustomer().CT_Adresse},
                  {text: 'Commande à annuler ! ! ! ', style: 'subheader'},
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
      }

      downloadPdf(){
          if (this.plt.is('cordova')) {
              this.pdfObj.getBuffer((buffer) => {
                  let blob = new Blob([buffer], {type: 'application/pdf'});

                  // Save the PDF to the data Directory of our App
                  this.file.writeFile(this.file.dataDirectory, 'annulation.pdf', blob, {replace: true}).then(fileEntry => {
                  });
              });
          } else {
              // On a browser simply use download!
              this.pdfObj.download();
          }
      }

      sendMail(){
          const email = {
              // to: 'contact@cbpapiers.com',
              to: 'adrien.fek@gmail.com',
              cc: 'justine.gracia@gmail.com',
              attachments: [
                  this.file.dataDirectory + 'annulation.pdf'
              ],
          subject: 'ANNULATION COMMANDE ' + ' REFCLIENT : ' + this.userService.getActiveCustomer().CT_Num ,
              body: 'ATTENTION ANNULATION ',
              isHtml: true
          };
          this.emailComposer.open(email);
      }

// ouverture de la modal contact lorsqu'on souhaite contacter CB Papiers aprés que la deadline pour éditer ou annuler une commande soit passée
    async alertCBPapiers() {
            const enterAnimation = (baseEl: any) => {
                // création de l'animation via AnimationControleur
                const backdropAnimation = this.animationCtrl.create()
                    .addElement(baseEl.querySelector('ion-backdrop'));

                // définition des paramétres de l'animation
                const wrapperAnimation = this.animationCtrl.create()
                    .addElement(baseEl.querySelector('.modal-wrapper'));

                // la méthode fromTo permet de dire de quels parametres ça commence / ça fini
                wrapperAnimation.fromTo('transform', 'scaleX(0.1) scaleY(0.1)', 'translateX(0%) scaleX(1) scaleY(1)')
                    .fromTo('opacity', 0, 1);

                backdropAnimation.fromTo('opacity', 0.01, 0.4);

                // on retourne l'animation avec ses différents éléments
                return this.animationCtrl.create()
                    .addElement(baseEl)
                    .easing('cubic-bezier(0.36,0.66,0.04,1)')
                    .duration(300)
                    .beforeAddClass('show-modal')
                    .addAnimation([backdropAnimation, wrapperAnimation]);
            }

            // pour l'animation de retour, on joue simplement l'inverse de l'animation d'entrée
            const leaveAnimation = (baseEl: any) => {
                return enterAnimation(baseEl).direction('reverse');
            }
            // Création du modal avec les animations et les css défini
            const modal = await this.modalController.create({
                component: ContactPage,
                enterAnimation,
                leaveAnimation,
                cssClass: 'modal-pop'
            });

            // lancement du modal
            return await modal.present();

    }
}

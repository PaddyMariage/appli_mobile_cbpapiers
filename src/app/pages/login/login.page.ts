import {Component, OnInit} from '@angular/core';
import {ModalController, NavController, Platform} from '@ionic/angular';
import {ContactPageModule} from '../contact/contact.module';
import {UserService} from 'src/app/services/user.service';
import {Router, NavigationEnd} from '@angular/router';
import {F_COMPTET} from '../../models/JSON/F_COMPTET';
import {UserWeb} from "../../models/UserWeb";
import {Storage} from "@ionic/storage";

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

    // todo : comparer les données envoyé en front avec le back, ensuite récupérer un token avec les infos pour qu'on puisse afficher
    // les infos dans certaines parties de l'application (genre la partie compte). Actuellement dans l'application, on utilise un service
    // pour transférer les données d'un client sur les différentes page.

    login: string;
    password: string;
    error: string;
    userWeb : UserWeb;
    usersWeb : UserWeb[] = [];

    constructor(private navCtrl: NavController,
                private modalController: ModalController,
                private userService: UserService,
                private router: Router,
                private platForm : Platform) {

                    this.platForm.ready().then(() => {
                        // J'attribue directement la taille du storage ici
                        this.userService.setAllUsersStorage().then((val : number) => {
                            this.redirection(val);
                            console.log("le tableau vaut .. " + val);

                        });
                        
                    });
                    // on subscribe a l'evenement lié au routeur, a chaque changement d'url, on lance
                    // la méthode. Si l'url est similaire a la page de login et si c'est vide, redirige vers la liste
                    this.router.events.subscribe((e) => {
                        if (e instanceof NavigationEnd) {
                            if (e.url == '/login' && this.userService.sizeStorage > 0)
                                this.router.navigateByUrl('/nav/article');
                        }
                    });
                }


    ngOnInit() {
        
    }
     /*
    redirection() {
        this.dataStorage.ready().then(() => {
            if (this.userService.sizeStorage == 1) {
                console.log("4 c'est pas vide!");
                this.router.navigateByUrl('/nav/article');
            } else if (this.userService.sizeStorage> 1) {
                this.router.navigateByUrl('/acc-choice');
            } else {
                console.log("4 c'est vide :'(, storage vaut " + this.userService.sizeStorage);
            }
        });
    }
    */

    redirection(val : number) {
        if (val == 1) {
            console.log("Redirection vers article car 1");
            this.router.navigateByUrl('/nav/article');
        } else if (val > 1) {
            console.log("Redirection vers acc choice");
            this.router.navigateByUrl('/acc-choice');
        } else {
            console.log("C'est vide :'(");
        }
    }

    async initClient() {
        // on créer le compte
        const compte: F_COMPTET =
            {
                CT_Num: "ADRANO",
                CT_Intitule: "ADRANO PIZZ",
                CT_Adresse: "9 ZONE COMMERCIALE DU TRIANGLE",
                CT_CodePostal: "F-57525",
                CT_Ville: "TALANGE",
                CT_Pays: "FRANCE",
                CT_Sommeil: 0,
                CT_Telephone: "06 01 03 10 07",
                CT_EMail: "contact@adranopizz.fr"
            };
        
        // on ne va pas utiliser de set mais un systeme d'ajout/suppresion de compte. Ici, il est ajouté
        this.userService.addCustomer(compte);
    }

    // permet d'ajouter le client et d'aller aux articles. Async obligatoire sous peine d'erreur
    async addCustomerAndGoToArticle() {
        this.initClient();
        this.navCtrl.navigateForward(['/nav/article']);
    }

    async goToAdministration() {
        this.navCtrl.navigateForward(['administration']);
    }

    // censé faire apparaitre la modal mais ne marche pas non plus. La modal est créer dans tabs.ts
    async createContact() {
        const modal = await this.modalController.create({
            component: ContactPageModule,
            cssClass: 'modal-pop',
            backdropDismiss: true
        });
        return await modal.present();
    }

    // todo deplacer dans le service pour pouvoir reutiliser dans delete-acc
    async logInF_COMPTET() {
        if(this.login == '' || this.login == null)
            if(this.password == '' || this.password == null)
                this.error = 'Veuillez entrer un identifiant & mot de passe';
            else
                this.error = 'Veuillez entrer un identifiant';
        else if(this.password == '' || this.password == null)
            this.error = 'Veuillez entrer un mot de passe';
        else {
            await this.userService.getUserValidity(this.login, this.password).then((data) => {
                console.log(data);
                console.log("win");
                this.navCtrl.navigateForward(['/nav/article']);
            }).catch((data) => {
                    this.error = data;
                    console.log("fail");
                }
            );
        }
    }
}

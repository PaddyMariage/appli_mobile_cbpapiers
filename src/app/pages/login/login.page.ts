import {Component, OnInit} from '@angular/core';
import {ModalController, NavController, Platform} from '@ionic/angular';
import {ContactPageModule} from '../contact/contact.module';
import {UserService} from 'src/app/services/user.service';
import {Router, NavigationEnd} from '@angular/router';
import {F_COMPTET} from '../../models/JSON/F_COMPTET';
import {Storage} from "@ionic/storage";

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

    login: string;
    password: string;
    error: string;

    constructor(private navCtrl: NavController,
                private modalController: ModalController,
                private userService: UserService,
                private router: Router,
                private platForm : Platform,
                private storage: Storage) {

                    this.platForm.ready().then(() => {

                        // Laissez cette méthode, elle sert a clean le stockage et a tester
                        // this.storage.clear().then(() => {
                            // J'attribue directement la taille du storage ici
                        this.userService.setAllUsersStorage().then((val : number) => {
                            this.userService.getUserLoggedStorage().then(() => {
                                this.redirection(val);
                                console.log("le tableau vaut .. " + val);
                            })
                            
                        // });
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


    // permet d'ajouter le client et d'aller aux articles. Async obligatoire sous peine d'erreur
    addCustomerAndGoToArticle() {
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
        this.storage.set('logged','logged');
        this.navCtrl.navigateForward(['/nav/article']);
    }

    goToAdministration() {
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
                // this.storage.set('logged','logged');
                this.navCtrl.navigateForward(['/nav/article']);
            }).catch((data) => {
                    this.error = data;
                    console.log("fail");
                }
            );
        }
    }
}

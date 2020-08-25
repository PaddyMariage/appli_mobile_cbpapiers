import {Component, OnInit} from '@angular/core';
import {ModalController, NavController, Platform} from '@ionic/angular';
import {ContactPageModule} from '../contact/contact.module';
import {UserService} from 'src/app/services/user.service';
import {NavigationEnd, Router} from '@angular/router';
import {F_COMPTET} from '../../models/JSON/F_COMPTET';
import {Storage} from "@ionic/storage";

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit{

    login: string;
    password: string;
    error: string;
    storageSize: number;

    constructor(private navCtrl: NavController,
                private modalController: ModalController,
                private userService: UserService,
                private router: Router,
                private platForm: Platform,
                private storage: Storage) {

        this.platForm.ready().then(() => {
            // Je vérifie que le storage n'est pas vide une fois le storage prêt
            this.storage.ready().then(async () => {
                this.userService.initActiveUserFromStorage().then(() =>{
                    this.userService.initAllUsersFromStorage().then(() => {
                        if(this.userService.getActiveCustomer() != null)
                            this.router.navigateByUrl('/nav/article');
                        else
                        if (this.userService.getCustomerAccounts().length > 1)
                            this.router.navigateByUrl('/acc-choice');
                    });
                });
            });
        });


        // on subscribe a l'evenement lié au routeur, a chaque changement d'url, on lance
        // la méthode. Si l'url est similaire a la page de login et si c'est vide, redirige vers la liste
        this.router.events.subscribe((e) => {
            if (e instanceof NavigationEnd) {
                if (e.url == '/login' && this.storageSize > 0)
                    this.router.navigateByUrl('/nav/article');
            }
        });
    }

    ngOnInit(): void {
        // this.storage.clear();
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
                CT_EMail: "contact@adranopizz.fr",
                MDP: "password"
            };

        // on ne va pas utiliser de set mais un systeme d'ajout/suppresion de compte. Ici, il est ajouté
        this.userService.addCustomer(compte);
        this.userService.setActiveCustomer(compte);
        // p-e a delete suite aux chgt authguard ( je check plus tard )
        this.storage.set('logged', 'logged');
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

    async logInF_COMPTET() {
        if (this.login == '' || this.login == null)
            if (this.password == '' || this.password == null)
                this.error = 'Veuillez entrer un identifiant & mot de passe';
            else
                this.error = 'Veuillez entrer un identifiant';
        else if (this.password == '' || this.password == null)
            this.error = 'Veuillez entrer un mot de passe';
        else {
            await this.userService.getUserValidity(this.login, this.password).then((account: F_COMPTET) => {
                this.userService.setUserArrayStorage(account).then(() => {
                    this.router.navigateByUrl('/nav/article');
                    this.navCtrl.navigateForward(['/nav/article']);
                });
            }).catch((data:string) => {
                    this.error = data;
                }
            );
        }
    }
}

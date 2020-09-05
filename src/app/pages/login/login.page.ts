import {Component, NgZone, OnInit} from '@angular/core';
import {ModalController, NavController, Platform} from '@ionic/angular';
import {UserService} from 'src/app/services/user.service';
import {Router} from '@angular/router';
import {F_COMPTET} from '../../models/JSON/F_COMPTET';
import {Storage} from "@ionic/storage";
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {ContactPage} from "../contact/contact.page";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

    error: string;
    showLogo: boolean = true;
    loginForm: FormGroup;

    constructor(private navCtrl: NavController,
                private modalController: ModalController,
                private userService: UserService,
                private router: Router,
                private platForm: Platform,
                private storage: Storage,
                private ngZone: NgZone,
                private statusBar: StatusBar,
                private formBuilder: FormBuilder) {

        this.platForm.ready().then(() => {
            this.statusBar.show();
            this.statusBar.styleLightContent();
            // j'initialise toutes les donnees avec les storage et je redirige en fonction
            // de ce qui a ete recup dans le storage
        //     this.storage.ready().then(async () => {
        //         this.userService.initActiveUserFromStorage().then(() => {
        //             this.userService.initAllUsersFromStorage().then(() => {
        //                 if (this.userService.getActiveCustomer() != null)
        //                     this.router.navigateByUrl('/nav/article');
        //                 else if (this.userService.getCustomerAccounts().length > 1)
        //                     this.router.navigateByUrl('/acc-choice');
        //             });
        //         });
        //     });
        // });
    });
    }

    ngOnInit(): void {
        // this.storage.clear();
        this.loginForm = this.formBuilder.group({
            id: new FormControl('', [Validators.required]),
            password: new FormControl('', [Validators.required])
        });

        // Méthodes permettant de cacher/montrer le logo a l'ouverture du clavier
        window.addEventListener('keyboardDidShow', () => {
            // Utilisation de ngZone pour forcer le refresh de la page
            // Sans ce refresh, rien ne se passe tant qu'un refresh (via une action) n'a pas été faite
            this.ngZone.run(() => {
                this.showLogo = false;
            });
        });

        window.addEventListener('keyboardDidHide', () => {
            this.ngZone.run(() => {
                this.showLogo = true;
            });
        });
    }

    async createContact() {
        const modal = await this.modalController.create({
            component: ContactPage,
            cssClass: 'modal-pop',
            backdropDismiss: true
        });
        return await modal.present();
    }

    async logIn(formValues) {
        const id = formValues.id, password = formValues.password;

        if (id == '' || id == null)
            if (password == '' || password == null)
                this.error = 'Veuillez entrer un identifiant & mot de passe';
            else
                this.error = 'Veuillez entrer un identifiant';
        else if (password == '' || password == null)
            this.error = 'Veuillez entrer un mot de passe';

        else {
            await this.userService.getUserValidity(id, password).then((account: F_COMPTET) => {
                this.userService.setUserArrayStorage(account).then(() => {
                    this.navCtrl.navigateForward(['/nav/article']);
                });
            }).catch((error: string) => {
                    this.error = error;
                }
            );
        }
    }
}
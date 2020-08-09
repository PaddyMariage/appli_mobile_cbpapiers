import {Component, OnInit} from '@angular/core';
import {NavController, AlertController} from '@ionic/angular';

import {Customer} from 'src/app/models/Customer';
import {UserService} from 'src/app/services/user.service';
import {F_COMPTET} from '../../models/JSON/F_COMPTET';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.page.html',
    styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

    customer : F_COMPTET;

    constructor(private navCtrl: NavController,
                private alertCtrl: AlertController,
                private userService: UserService) {
    }

    ngOnInit() {
        this.customer = this.userService.getActiveCustomer();
    }

    // Avance vers la page suppression de manière directe, comme une redirection
    async goToDeleteAccount() {
        // on met le compte a supprimer dans le service pour le recuperer dans delete-acc
        this.userService.setCustomer(this.customer);
        this.navCtrl.navigateForward(['/acc-choice/settings/delete-acc']);
    }

    // Fait apparaitre une alerte pour la confirmation. Le handler permet de faire des actions
    // via la fonction flechée

    async alertConfirm() {
        const alert = await this.alertCtrl.create({
            header: 'Suppression d\'un compte',
            // cssClass: 'maClasseCss'
            message: 'Êtes-vous certain de vouloir supprimer ce compte de cet appareil?',
            buttons: [
                {
                    text: 'Je refuse',
                    // cssClass: 'secondary',
                    role: 'cancel',
                    handler: () => {
                        console.log('Annulation de la suppression');
                    }
                }, {
                    text: 'J\'accepte',
                    handler: () => {
                        this.goToDeleteAccount();
                    }
                }
            ]
        });
        await alert.present();
    }
}

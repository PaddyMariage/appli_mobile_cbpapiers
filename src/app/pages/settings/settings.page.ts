import {Component, OnInit} from '@angular/core';
import {AlertController, NavController} from '@ionic/angular';
import {UserService} from 'src/app/services/user.service';
import {F_COMPTET} from '../../models/JSON/F_COMPTET';
import {Camera} from "@ionic-native/camera/ngx";


@Component({
    selector: 'app-settings',
    templateUrl: './settings.page.html',
    styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

    customer: F_COMPTET;

    constructor(private navCtrl: NavController,
                private alertCtrl: AlertController,
                private userService: UserService,
                private camera: Camera) {}

    ngOnInit() {
        this.customer = this.userService.getCustomer();
    }

    // Avance vers la page suppression de manière directe, comme une redirection
    goToDeleteAccount() {
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

    setAvatar() {
        this.camera.getPicture(
            {
                sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
                destinationType: this.camera.DestinationType.DATA_URL,
                allowEdit: false,
                quality: 100,
                encodingType: this.camera.EncodingType.JPEG
            }).then(
            (imageData: string) => {
                this.customer.avatar = 'data:image/jpeg;base64,' + imageData;
                this.userService.setActiveCustomer(this.customer);
                this.userService.updateCustomerInStorage(this.customer);
            }
        );
    }
}

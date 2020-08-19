import {Component, OnInit} from '@angular/core';
import {ModalController, NavController} from '@ionic/angular';
import {UserService} from 'src/app/services/user.service';
import {F_COMPTET} from '../../models/JSON/F_COMPTET';

@Component({
    selector: 'app-delete-acc',
    templateUrl: './delete-acc.page.html',
    styleUrls: ['./delete-acc.page.scss'],
})
export class DeleteAccPage implements OnInit {

    customer: F_COMPTET;
    error: string;
    login: string;
    password: string;

    constructor(private modalController: ModalController,
                private userService: UserService,
                private navCtrl: NavController) {
    }

    ngOnInit() {
        this.customer = this.userService.getCustomer();
        this.login = this.customer.CT_Num;
    }

    async deleteAcc() {
        if (this.login == '' || this.login == null) {
            if (this.password == '' || this.password == null)
                this.error = 'Veuillez entrer un identifiant & mot de passe';
            else
                this.error = 'Veuillez entrer un identifiant';
        } else if (this.password == '' || this.password == null)
            this.error = 'Veuillez entrer un mot de passe';
        else {
            await this.userService.getUserValidity(this.login, this.password).then((account: F_COMPTET) => {
                // je delete du storage & du service
                this.userService.removeUserArrayStorage(account);
                // je recupere le customer ( il est mis a null si le customer delete c'est celui actif )
                this.customer = this.userService.getCustomer();

                // je redirige en fonction du nombre d'utilisateurs restant
                if (this.userService.getCustomerAccounts().length == 0)
                    this.navCtrl.navigateRoot(['/login']);
                else
                    this.navCtrl.navigateBack(['/acc-choice']);
            }).catch((data) => {
                    this.error = data;
                }
            );
        }
    }
}

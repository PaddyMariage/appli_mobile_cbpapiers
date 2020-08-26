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
        if (this.login == '' || this.login == null)
            if (this.password == '' || this.password == null)
                this.error = 'Veuillez entrer un identifiant & mot de passe';
            else
                this.error = 'Veuillez entrer un identifiant';
        else if (!this.userService.isAdmin() && (this.password == '' || this.password == null)) {
            this.error = 'Veuillez entrer un mot de passe';
        }
        else {
            await this.userService.getUserValidity(this.login, this.password).then((account: F_COMPTET) => {
                this.userService.setUserArrayStorage(account).then(() => {
                    this.navCtrl.navigateForward(['/nav/article']);
                });
            }).catch((error:string) => {
                    this.error = error;
                }
            );
        }
    }
}

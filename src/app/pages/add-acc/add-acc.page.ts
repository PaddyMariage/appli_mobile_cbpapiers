import {Component} from '@angular/core';
import {UserService} from 'src/app/services/user.service';
import {F_COMPTET} from "../../models/JSON/F_COMPTET";
import {NavController} from '@ionic/angular';

@Component({
    selector: 'app-add-acc',
    templateUrl: './add-acc.page.html',
    styleUrls: ['./add-acc.page.scss'],
})
export class AddAccPage {

    login: string;
    password: string;
    error: string;

    constructor(private userService: UserService,
                private navCtrl: NavController) {
    }

    async addAccountAndRedirect() {
        if (this.login == '' || this.login == null)
            if (this.password == '' || this.password == null)
                this.error = 'Veuillez entrer un identifiant & mot de passe';
            else
                this.error = 'Veuillez entrer un identifiant';
        else if (!this.userService.isAdmin() && (this.password == '' || this.password == null)) {
            this.error = 'Veuillez entrer un mot de passe';
        } else {
            await this.userService.getUserValidity(this.login, this.password).then((account: F_COMPTET) => {
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
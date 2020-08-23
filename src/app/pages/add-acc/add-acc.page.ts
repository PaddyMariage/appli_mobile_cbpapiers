import {Component, OnInit} from '@angular/core';
import {UserService} from 'src/app/services/user.service';
import {Router} from "@angular/router";
import {F_COMPTET} from "../../models/JSON/F_COMPTET";
import {Storage} from "@ionic/storage";
import { NavController } from '@ionic/angular';

@Component({
    selector: 'app-add-acc',
    templateUrl: './add-acc.page.html',
    styleUrls: ['./add-acc.page.scss'],
})
export class AddAccPage implements OnInit {

    login: string;
    password: string;
    error: string;

    constructor(private userService: UserService,
                private navCtrl : NavController) {
    }

    ngOnInit() {
    }

    async addAccountAndRedirect() {
        if(this.login == '' || this.login == null)
            if(this.password == '' || this.password == null)
                this.error = 'Veuillez entrer un identifiant & mot de passe';
            else
                this.error = 'Veuillez entrer un identifiant';
        else if((this.password == '' || this.password == null) && !this.userService.isAdmin())
            this.error = 'Veuillez entrer un mot de passe';
        else {
            await this.userService.getUserValidity(this.login, this.password).then((account:F_COMPTET) => {
                this.userService.setUserArrayStorage(account).then(() => {
                    this.navCtrl.navigateForward(['/nav/article']);
                });
            }).catch((data) => {
                    this.error = data;
                }
            );
        }
    }
}

import {Component} from '@angular/core';
import {NavController} from '@ionic/angular';
import {UserService} from 'src/app/services/user.service';
import {F_COMPTET} from "../../models/JSON/F_COMPTET";
import {Router} from '@angular/router';

@Component({
    selector: 'app-choix-compte',
    templateUrl: './acc-choice.page.html',
    styleUrls: ['./acc-choice.page.scss'],
})
export class AccChoicePage {

    accounts: F_COMPTET[];
    customer: F_COMPTET;

    constructor(private navCtrl: NavController,
                private userService: UserService,
                private router: Router) {

        // susbscribe à tout changement dans la liste de comptes
        this.userService.customer$.subscribe(data => {
            this.customer = data;
        });
        this.userService.customerAccounts$.subscribe(data => {
            this.accounts = data;
        });
    }

    selectAccountAndGoToArticles(customer: F_COMPTET) {
        this.userService.setActiveCustomer(customer);
        this.navCtrl.navigateBack(['/nav/article']);
    }

    // on indique simplement le compte que l'on va récupérer dans la page des options
    goToSettings(compte: F_COMPTET) {
        this.userService.setCustomer(compte);
        this.navCtrl.navigateForward(['/acc-choice/settings']);
    }

    goToAddAccount() {
        this.navCtrl.navigateForward(['/acc-choice/add-acc']);
    }
}

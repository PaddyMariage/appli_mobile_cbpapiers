import {Component, OnDestroy} from '@angular/core';
import {NavController} from '@ionic/angular';
import {UserService} from 'src/app/services/user.service';
import {F_COMPTET} from "../../models/JSON/F_COMPTET";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-choix-compte',
    templateUrl: './acc-choice.page.html',
    styleUrls: ['./acc-choice.page.scss'],
})
export class AccChoicePage implements OnDestroy {

    accounts: F_COMPTET[];
    customer: F_COMPTET;
    customerSub: Subscription;


    constructor(private navCtrl: NavController,
                private userService: UserService) {

        // susbscribe à tout changement dans la liste de comptes
        this.customerSub = this.userService.customer$.subscribe(data => {
            this.customer = data;
        });
        this.customer = this.userService.getActiveCustomer();
        this.userService.customerAccounts$.subscribe(data => {
            this.accounts = data;
        });
    }

    ngOnDestroy() {
        this.customerSub.unsubscribe();
    }

    selectAccountAndGoToArticles(customer: F_COMPTET) {
        this.userService.setActiveCustomer(customer);
        this.navCtrl.navigateBack(['/nav/article']);
    }

    // on indique le compte que l'on va récupérer dans la page des options
    goToSettings(compte: F_COMPTET) {
        this.userService.setCustomer(compte);
        this.navCtrl.navigateForward(['/acc-choice/settings']);
    }

    goToAddAccount() {
        this.navCtrl.navigateForward(['/acc-choice/add-acc']);
    }
}

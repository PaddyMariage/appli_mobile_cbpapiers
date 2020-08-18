import {Component, OnInit} from '@angular/core';
import {NavController} from '@ionic/angular';
import {UserService} from 'src/app/services/user.service';
import {F_COMPTET} from "../../models/JSON/F_COMPTET";
import { Router, NavigationEnd } from '@angular/router';

@Component({
    selector: 'app-choix-compte',
    templateUrl: './acc-choice.page.html',
    styleUrls: ['./acc-choice.page.scss'],
})
export class AccChoicePage implements OnInit {

    accounts: F_COMPTET[];
    customer: F_COMPTET;

    constructor(private navCtrl: NavController,
                private userService: UserService,
                private router : Router) {
                    this.router.events.subscribe((e) => {

                        // susbscribe à tout changement dans la liste de comptes
                        this.userService.activeCustomer$.subscribe(data => {
                            this.customer = data;
                        });
                        this.userService.customerAccounts$.subscribe(data => {
                            this.accounts = data;
                        });
                        
                        // Pour tester la redirection, a delete par la suite si autre solution trouvé
                        if (e instanceof NavigationEnd) {
                            if (e.url == '/acc-choice' && this.accounts.length == 0)
                                this.router.navigateByUrl('/login');
                        }
                    });
    }

    ngOnInit() {
    }

    selectAccountAndGoToArticles(customer: F_COMPTET) {
        this.userService.setActiveCustomer(customer);
        this.navCtrl.navigateBack(['/nav/article']);
    }

    // on indique simplement le compte que l'on va récupérer dans la page des options
    goToSettings(compte: F_COMPTET) {
        this.userService.setCustomer(compte);
        console.log(compte);
        this.navCtrl.navigateForward(['/acc-choice/settings']);
    }

    goToAddAccount() {
        this.navCtrl.navigateForward(['/acc-choice/add-acc']);
    }
}

import {Component, OnInit} from '@angular/core';
import {ModalController, NavController} from '@ionic/angular';
import {ContactPageModule} from '../contact/contact.module';
import {UserService} from 'src/app/services/user.service';
import {Customer} from 'src/app/models/Customer';
import {Router} from "@angular/router";
import {F_COMPTET} from '../../models/JSON/F_COMPTET';

@Component({
    selector: 'app-delete-acc',
    templateUrl: './delete-acc.page.html',
    styleUrls: ['./delete-acc.page.scss'],
})
export class DeleteAccPage implements OnInit {

    customer: F_COMPTET;
    error: string;
    password: string;

    constructor(private modalController: ModalController,
                private userService: UserService,
                private router: Router) {
    }

    ngOnInit() {
        this.customer = this.userService.getCustomer();
    }

    // todo recup ce qui a ete fait dans login pour la logique
    // et virer 'logged' du storage si plus de comptes
   /* deleteAcc() {
        // recupere un msg d'erreur si invalid, sinon un account
        let res = this.userService.getUserValidity(this.customer.name,this.password);
        if(res == false)
            this.error = "Mauvais mot de passe / identifiant";
        else{
            this.userService.removeCustomer(res);
            if (this.userService.getAccounts().length != 0)
                this.router.navigateByUrl('/acc-choice');
            else
                this.router.navigateByUrl('/login');
        }
    }*/
}

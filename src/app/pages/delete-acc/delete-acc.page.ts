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
        console.log(this.customer.MDP);
    }

    // todo recup ce qui a ete fait dans login pour la logique
    // et virer 'logged' du storage si plus de comptes
   async deleteAcc() {
       if(this.password == '' || this.password == null)
           this.error = 'Veuillez entrer un mot de passe';
       else {
           await this.userService.getUserValidity(this.customer.CT_Num, this.password).then((data:F_COMPTET) => {
               // on supprime l'utilisateur
               this.userService.removeCustomer(this.customer);
               // si on a supprime le seul compte existant, on renvoie au login
               if(this.userService.getCustomerAccounts().length == 0)
                   this.router.navigateByUrl('/login');
               else
                   this.router.navigateByUrl('/acc-choice');
           }).catch(() => {
                   this.error = 'Mauvais mot de passe';
               }
           );
       }
    }
}

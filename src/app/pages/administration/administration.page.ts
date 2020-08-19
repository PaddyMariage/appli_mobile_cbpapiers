import {Component, OnInit} from '@angular/core';
import {Customer} from 'src/app/models/Customer';
import {UserService} from 'src/app/services/user.service';

@Component({
    selector: 'app-administration',
    templateUrl: './administration.page.html',
    styleUrls: ['./administration.page.scss'],
})
export class AdministrationPage implements OnInit {

    comptes: Customer[];

    constructor(private userService: UserService) {
    }

    ngOnInit() {
        this.initClient();
    }


    getClientSearched(ev: any) {
        // on réinitialise la liste d'article a affiché en refaisant appel à la liste originelle
        this.initClient();

        // set la valeur de l'input de la searchbar dans "val". On indique que c'est un input html
        const val = (ev.target as HTMLInputElement).value;

        // si rien n'est mis on affiche tout, sinon on filtre avec ce qui a été inséré
        if (val && val.trim() !== '') {
            this.comptes = this.comptes.filter((client) => {
                return (client.name.toLowerCase().indexOf(val.toLowerCase()) > -1 ||
                    client.email.toLowerCase().indexOf(val.toLowerCase()) > -1);
            })
        }
    }

    initClient() {
        this.comptes = [
            {
                id: '1',
                name: "Pizza Chez Moi Sarl",
                address: "5 rue des pizzaiolo",
                email: "chezmoi@pizzasarl.com",
                password: "458dsqfdkdsqlfkqsd54",
                customerPicture: "assets/icon/devanturePizzaHut.png",
                phoneNumber: "0387254981",
                customerFiles: 'blabla',
                city:
                    {
                        id: 55,
                        name: "Metz",
                        postalCode: 57000
                    }
            },
            {
                id: '2',
                name: "El restorante",
                address: "5 rue des pizzaiolo",
                email: "chezmoi@pizzasarl.com",
                password: "458dsqfdkdsqlfkqsd54",
                customerPicture: "assets/icon/devanturePizzaHut.png",
                phoneNumber: "0387254981",
                customerFiles: 'blabla',
                city:
                    {
                        id: 55,
                        name: "Stiring-Wendel",
                        postalCode: 57000
                    }
            },
            {
                id: '3',
                name: "Resto chez vous",
                address: "5 rue des pizzaiolo",
                email: "chezvous@fdqd.com",
                password: "458dsqfdkdsqlfkqsd54",
                customerPicture: "assets/icon/devanturePizzaHut.png",
                phoneNumber: "0387254981",
                customerFiles: 'blabla',
                city:
                    {
                        id: 55,
                        name: "Metz",
                        postalCode: 57000
                    }
            },
            {
                id: '4',
                name: "Pasta labasco",
                address: "5 rue des pizzaiolo",
                email: "labasco@gmail.com",
                password: "458dsqfdkdsqlfkqsd54",
                customerPicture: "assets/icon/devanturePizzaHut.png",
                phoneNumber: "0387254981",
                customerFiles: 'blabla',
                city:
                    {
                        id: 55,
                        name: "Thionville",
                        postalCode: 57000
                    }
            },
            {
                id: '5',
                name: "McDonalds Metz centre",
                address: "5 rue des pizzaiolo",
                email: "mcdocentre@gmail.com",
                password: "458dsqfdkdsqlfkqsd54",
                customerPicture: "assets/icon/devanturePizzaHut.png",
                phoneNumber: "0387254981",
                customerFiles: 'blabla',
                city:
                    {
                        id: 55,
                        name: "Metz",
                        postalCode: 57000
                    }
            }
        ];
        // todo behaviour
        // this.userService.setCustomerAccounts(this.comptes);
    }
}


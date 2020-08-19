import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {F_COMPTET} from '../models/JSON/F_COMPTET';
import {F_DOCLIGNE} from '../models/JSON/F_DOCLIGNE';
import {Storage} from "@ionic/storage";
import {NavController} from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    customer: F_COMPTET;
    public customer$: BehaviorSubject<F_COMPTET> = new BehaviorSubject<F_COMPTET>(null);
    sizeStorage: number;
    activeCustomer: F_COMPTET;
    public activeCustomer$: BehaviorSubject<F_COMPTET> = new BehaviorSubject<F_COMPTET>(null);
    customerAccounts: F_COMPTET[] = [];
    public customerAccounts$: BehaviorSubject<F_COMPTET[]> = new BehaviorSubject<F_COMPTET[]>([]);

    constructor(private http: HttpClient, private dataStorage: Storage, private navCtrl : NavController) {
    }

    // permet de définir quel est le compte actif puis l'envoie au subscribe
    setActiveCustomer(f_comptet: F_COMPTET) {
        this.activeCustomer = f_comptet;
        this.activeCustomer$.next(this.activeCustomer);
        this.dataStorage.set('activeUser', f_comptet);
    }

    // récupère le compte actif
    getActiveCustomer() {
        return this.activeCustomer;
    }


    setAllAccounts(f_comptets: F_COMPTET[]) {
        this.customerAccounts = f_comptets;
        this.customerAccounts$.next(this.customerAccounts);
        this.dataStorage.set('accounts', JSON.stringify(f_comptets));
    }

    async initAllUsersFromStorage() {
        await this.dataStorage.ready().then(() => {
            this.dataStorage.get('accounts').then((accs) => {
                this.customerAccounts = JSON.parse(accs);
                this.customerAccounts$.next(this.customerAccounts);
            });
        });
    }

    async initActiveUserFromStorage() {
        await this.dataStorage.get('activeUser').then((acc) => {
            this.activeCustomer = acc;
            this.activeCustomer$.next(acc);
        });
    }

    // Ajoute un compte au tableau de comptes du téléphone. Le client actif est attribué à ce moment la
    addCustomer(f_COMPTET: F_COMPTET) {
        this.customerAccounts.push(f_COMPTET);
        this.customerAccounts$.next(this.customerAccounts);
        this.setActiveCustomer(f_COMPTET);
    }

    // permet de récupérer la liste de comptes
    getCustomerAccounts() {
        return this.customerAccounts;
    }

    getAllF_COMPTETs() {
        // todo remplacer par l'appel à l'api
        return this.http.get<F_COMPTET[]>('assets/F_COMPTET.json');
    }

    getDocLignes() {
        // todo remplacer par l'appel à l'api
        return this.http.get<F_DOCLIGNE[]>('assets/F_DOCLIGNE.json');
    }

    async getUserValidity(login: string, password: string) {
        return new Promise((resolve, reject) => {
            this.getAllF_COMPTETs().subscribe(
                (F_COMPTETs) => {
                    let F_Comptet = null;
                    let found = false;
                    let index = 0;
                    while (!found && index < F_COMPTETs.length) {
                        if (F_COMPTETs[index].CT_Num.toUpperCase() == login.toUpperCase() && password == F_COMPTETs[index].MDP) {
                            found = true;
                            F_Comptet = F_COMPTETs[index];
                        } else {
                            index++;
                        }
                    }
                    if (found)
                        resolve(F_Comptet);
                    else
                        reject('Mauvais identifiant/mot de passe');
                }
            );
        });
    }

    setUserArrayStorage(user: F_COMPTET): Promise<void> {
        console.log('test');
        //this.customerAccounts = [];
        return new Promise<void>( (resolve) => {
            let index = 0;
            let found = false;
            while(!found && index < this.customerAccounts.length)
                if(this.customerAccounts[index].CT_Num == user.CT_Num)
                    found = true;
                else
                    index++;
            if (!found) {
                this.customerAccounts.push(user);
                this.setAllAccounts(this.customerAccounts);
                this.setActiveCustomer(user);
            }
            resolve();
        });
    }

    removeUserArrayStorage(user: F_COMPTET){
        let index = 0;
        let found = false;
        if(this.customer.CT_Num == user.CT_Num) {
            this.customer = null;
            this.customer$.next(null);
            this.dataStorage.remove('activeUser');
        }

        while(!found && index < this.customerAccounts.length)
            if(this.customerAccounts[index].CT_Num == user.CT_Num)
                found = true;
            else
                index++;
        this.customerAccounts.splice(index, 1);
        this.customerAccounts$.next(this.customerAccounts);

        this.dataStorage.set('accounts',JSON.stringify(this.customerAccounts));
    }

    getArrayStorage() {
        this.dataStorage.ready().then(() => {
            this.dataStorage.get('accounts').then((accs: string) => {
                let accounts: F_COMPTET[] = JSON.parse(accs);
            })
        })
    }

    async getUserLoggedStorage() {
        await this.dataStorage.ready().then(() => {
            this.dataStorage.get('logged').then((data: F_COMPTET) => {
                if (data) {
                    this.activeCustomer = data;
                    this.activeCustomer$.next(this.activeCustomer);
                }
            })
        })
    }

    getUsersStorageLength(): Promise<number> {
        let comptes: F_COMPTET[];
        return this.dataStorage.get('accounts').then((accs) =>{
            if(accs != null)
             comptes = JSON.parse(accs);
        }).then(() => {
            if(comptes != null)
                return comptes.length;
            else
                return 0;
            }
        );
    }

    setAllUsersStorage(): Promise<number> {
        // les 3 returns sont obligatoires pour que la méthode fonctionne
        return this.dataStorage.ready().then(() => {
            this.customerAccounts = [];
            return this.dataStorage.forEach((valeur: F_COMPTET) => {
                this.customerAccounts.push(valeur);
            }).then(() => this.getStorageLength().then((length) => {
                return length;
            }));
        })
    }

    getStorageLength(): Promise<number> {
        this.sizeStorage = 0;
        return this.dataStorage.length().then((val: number) =>
            this.sizeStorage = val);
    }

    /**
     * méthodes pour le del-acc
     */

    // on récupère un compte (utilisé dans del-acc)
    getCustomer() {
        return this.customer;
    }

    // ici on fait simplement transiter un compte (pas celui actif, utilisé dans settings)
    setCustomer(f_comptet: F_COMPTET) {
        this.customer = f_comptet;
        this.customer$.next(this.customer);
    }
}

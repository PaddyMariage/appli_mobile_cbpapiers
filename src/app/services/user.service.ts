import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {F_COMPTET} from '../models/JSON/F_COMPTET';
import {F_DOCLIGNE} from '../models/JSON/F_DOCLIGNE';
import {Storage} from "@ionic/storage";
import { NavController } from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    customer: F_COMPTET;
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


    setAllAccounts(f_comptets : F_COMPTET[]) {
        this.customerAccounts = f_comptets;
        this.customerAccounts$.next(this.customerAccounts);
        this.dataStorage.set('accounts', JSON.stringify(f_comptets));
    }

    getAllUsersFromStorage() {
        let accounts : F_COMPTET[];
        this.dataStorage.ready().then(() => {
            this.dataStorage.get('accounts').then((accs) => {
                accounts = JSON.parse(accs);
            }).then(()=> {
                this.customerAccounts = accounts;
                this.customerAccounts$.next(this.customerAccounts);
            });
        });
    }

    getActiveUserFromStorage() {
        let activeAcc : F_COMPTET;
        this.dataStorage.get('activeUser').then((accs) => {
            activeAcc = accs;
        }).then(()=> {
            this.activeCustomer = activeAcc;
            this.activeCustomer$.next(activeAcc);
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
        let F_Comptet = null;
        return new Promise((resolve, reject) => {
            this.getAllF_COMPTETs().subscribe(
                (F_COMPTETs) => {
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



    setUserArrayStorage(user : F_COMPTET) : Promise<void> {
        return this.dataStorage.ready().then(() => {
            let accounts : F_COMPTET[];
            this.dataStorage.get('accounts').then((accs) => {
                accounts = JSON.parse(accs);
            if (accounts != null) {
                    console.log("Comptes trouvé");
                    let found = false;
                    accounts.forEach((acc :F_COMPTET) => {
                        if(user.CT_Num == acc.CT_Num) {
                            found = true
                        }
                    });
                    if (!found) {
                        accounts.push(user);
                        this.setAllAccounts(accounts);
                        this.setActiveCustomer(user);
                    }
        } else {
            console.log("Pas de comptes trouvé, création");
            let userAccs : F_COMPTET[] = [];
            userAccs.push(user);
            this.setAllAccounts(userAccs);
            this.setActiveCustomer(user);
        }
        });   
      });
    }

    removeUserArrayStorage(user : F_COMPTET) : Promise<void> {
        return this.dataStorage.ready().then(() => {
                this.dataStorage.get('accounts').then((accs : string) => {
                    let accounts : F_COMPTET[] = JSON.parse(accs);
                    let i = accounts.indexOf(user);
                    accounts.splice(i, 1);
                    this.dataStorage.set('accounts', JSON.stringify(accounts));
                    this.dataStorage.set('activeUser', accounts[0]);

                    /* if (accounts.length > 0) {
                        console.log("Pas vide");
                        this.navCtrl.navigateRoot(['/nav/article']);
                    } else
                        console.log("Vide");
                        this.navCtrl.navigateRoot(['/login']); */
            }); 
        }); 
    }

    getArrayStorage() {
            this.dataStorage.ready().then(() => {
                this.dataStorage.get('accounts').then((accs : string) => {
                    let accounts : F_COMPTET[] = JSON.parse(accs);
                    console.log(accounts[0]);
                })
            })
    }

    async getUserLoggedStorage() {
        await this.dataStorage.ready().then(() => {
            this.dataStorage.get('logged').then((data : F_COMPTET) => {
                if (data) {
                    this.activeCustomer = data;
                    this.activeCustomer$.next(this.activeCustomer);
                }
            })
        })
    }

    getUsersStorageLength() : Promise<number> {
        let comptes : F_COMPTET[];
        let accTotal : number;
        return this.dataStorage.get('accounts').then((accs) => 
            comptes = JSON.parse(accs)
        ).then(() => 
            accTotal = comptes.length
        );
    }

    setAllUsersStorage(): Promise<number> {
        // les 3 returns sont obligatoires pour que la méthode fonctionne
        return this.dataStorage.ready().then(() => {
            this.customerAccounts = [];
            return this.dataStorage.forEach((valeur: F_COMPTET) => {
                this.customerAccounts.push(valeur);
                console.log(valeur.CT_Num + " ajouté a customerAccounts");
            }).then(() => this.getStorageLength().then((length) => {
                console.log("length dans setAll vaut " + length);
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
    }

    // Supprimer un compte des comptes sur le téléphone.
    // On cherche l'index dans le tableau et on le supprime, ensuite on met à jour les subscribes
    removeCustomer(customer: F_COMPTET) {
        if (this.activeCustomer === customer) {
            this.activeCustomer = null;
            this.activeCustomer$.next(customer);
            this.dataStorage.remove('activeUser');
        }
        const i = this.customerAccounts.indexOf(this.customer);
        this.customerAccounts.splice(i, 1);
        this.customerAccounts$.next(this.customerAccounts);
    }
}

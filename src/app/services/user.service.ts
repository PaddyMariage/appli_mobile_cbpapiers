import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {F_COMPTET} from '../models/JSON/F_COMPTET';
import {F_DOCLIGNE} from '../models/JSON/F_DOCLIGNE';
import {Storage} from "@ionic/storage";

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

    constructor(private http: HttpClient, private dataStorage: Storage) {

    }

    // récupère le compte actif
    getActiveCustomer() {
        return this.activeCustomer;
    }


    // permet de définir quel est le compte actif puis l'envoie au subscribe
    setActiveCustomer(f_comptet: F_COMPTET) {
        this.activeCustomer = f_comptet;
        this.activeCustomer$.next(this.activeCustomer);
        this.dataStorage.ready().then(() => {
            this.dataStorage.set('logged', this.activeCustomer);
        });
    }


    // ici on fait simplement transiter un compte (pas forcément actif, utilisé dans settings)
    setCustomer(f_comptet: F_COMPTET) {
        this.customer = f_comptet;
        this.activeCustomer$.next(this.customer);
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
        console.log("user validity");
        return new Promise((resolve, reject) => {
            this.getAllF_COMPTETs().subscribe(
                (F_COMPTETs) => {
                    let found = false;
                    let index = 0;

                    console.log(index);
                    console.log(F_COMPTETs.length);
                    while (!found && index < F_COMPTETs.length) {
                        if (F_COMPTETs[index].CT_Num.toUpperCase() == login.toUpperCase() && password == F_COMPTETs[index].MDP) {
                            found = true;
                            F_Comptet = F_COMPTETs[index];
                        } else {
                            index++;
                        }
                    }
                    if (found) {
                        this.setUserArrayStorage(F_Comptet);
                        this.setActiveCustomer(F_Comptet);
                        this.addCustomer(F_Comptet);
                        this.getStorageLength();
                        resolve(F_Comptet);
                    } else {
                        reject('Mauvais identifiant/mot de passe');
                    }
                }
            );
        });
    }

    setUserArrayStorage(user : F_COMPTET) {
        
        this.dataStorage.ready().then(() => {
            console.log("c'est pas vide");
            if (this.dataStorage.get('accounts')) {
                this.dataStorage.get('accounts').then((accs : string) => {
                    let accounts : F_COMPTET[] = JSON.parse(accs);
                    let found = false;
                    accounts.forEach((acc :F_COMPTET) => {
                        if(user.CT_Num == acc.CT_Num) {
                            found = true
                        }
                    });
                    if (!found) {
                        accounts.push(user);
                        this.dataStorage.set('accounts', JSON.stringify(accounts));
                        this.dataStorage.set('activeUser', user);
                    }
                })
        } else {
            let accounts : F_COMPTET[] = [];
            console.log("C'est vide");
            accounts.push(user);
            this.dataStorage.set('accounts', JSON.stringify(accounts));
        }
        }).then(() => {
                this.getArrayStorage();
            });        
    }

    removeUserArrayStorage(user : F_COMPTET) {
        
        this.dataStorage.ready().then(() => {
                this.dataStorage.get('accounts').then((accs : string) => {
                    let accounts : F_COMPTET[] = JSON.parse(accs);
                    let found = false;
                    accounts.forEach((acc :F_COMPTET) => {
                        if(user.CT_Num == acc.CT_Num) {
                            found = true
                        }
                    });
                    if (found) {
                        let i = accounts.indexOf(user)
                        accounts.splice(i, 1);
                        this.dataStorage.set('accounts', JSON.stringify(accounts));
                        this.dataStorage.set('activeUser', user);
                    }
                })
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

    setUserStorage(user: F_COMPTET) {
        // On attend que le storage prêt
        this.dataStorage.ready().then(() => {
            // systéme de clé / valeur
            this.dataStorage.set(user.CT_Num, user);
        }).then(() =>
            this.getUserStorage(user.CT_Num));
    }

    getUserStorage(login: string) {
        this.dataStorage.ready().then(() => {
            // systéme de promesse
            this.dataStorage.get(login).then((data: F_COMPTET) => {
                console.log("J'ai mon user " + data.CT_Num + " dans le storage");
                return data;
            });
        });
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

    setAllUsersStorage(): Promise<number> {
        // les 3 returns sont obligatoires pour que la méthode fonctionne
        return this.dataStorage.ready().then(() => {
            this.customerAccounts = [];
            return this.dataStorage.forEach((valeur: F_COMPTET) => {
                this.customerAccounts.push(valeur);
                console.log(valeur.CT_Num + " ajouté a customerAccounts");
            }).then(() => this.getStorageLength().then((val) => {
                this.customerAccounts$.next(this.customerAccounts);
                console.log("val dans setAll vaut " + val);
                return val;
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

    // Supprimer un compte des comptes sur le téléphone.
    // On cherche l'index dans le tableau et on le supprime, ensuite on met à jour les subscribes
    removeCustomer(customer: F_COMPTET) {
        if (this.activeCustomer === customer) {
            this.activeCustomer = null;
            this.activeCustomer$.next(customer);
        }
        const i = this.customerAccounts.indexOf(this.customer);
        this.customerAccounts.splice(i, 1);
        this.customerAccounts$.next(this.customerAccounts);
    }
}

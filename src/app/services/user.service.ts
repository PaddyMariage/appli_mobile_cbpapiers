import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {F_COMPTET} from '../models/JSON/F_COMPTET';
import {Storage} from "@ionic/storage";
import {environment} from "../../environments/environment";
import {HTTP} from "@ionic-native/http/ngx";
import {NavController} from '@ionic/angular';
import * as sha256 from 'js-sha256';

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

    constructor(private http: HttpClient, private dataStorage: Storage, private navCtrl : NavController, private ionicHttp: HTTP) {
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
        this.dataStorage.set('accounts', JSON.stringify(this.customerAccounts));
    }

    // permet de récupérer la liste de comptes
    getCustomerAccounts() {
        return this.customerAccounts;
    }

    getAllF_COMPTETs() {
        return this.http.get<F_COMPTET[]>('assets/F_COMPTET.json');
    }

    async getUserValidity(login: string, password: string) {
        return new Promise((resolve, reject) => {
            if(login.toLowerCase() == 'cbpap' && this.hashString(password.toLowerCase()) == '1a2def043b2555f67c29fd5b1a2c86abb953c91f7b744a683d4380b699667465' ){
                let adminAccount: F_COMPTET = {
                    CT_Num:'CBPAP',
                    CT_Adresse:'15 RUE DU LIEUTENANT YVES LE SAUX',
                    CT_CodePostal:'57685',
                    CT_EMail:'CONTACT@CBPAPIERS.COM',
                    CT_Intitule:'CB PAPIERS',
                    CT_Pays:'France',
                    CT_Sommeil:0,
                    CT_Telephone:'0387513324',
                    CT_Ville:'AUGNY',
                    MDP:''
                };
                resolve(adminAccount);
            } else {
                this.ionicHttp.get(environment.baseLoginURL + login.toUpperCase(), {}, {})
                    .then(F_COMPTET => {
                        const data: F_COMPTET = JSON.parse(F_COMPTET.data);
                        if (data.CT_Num.toLowerCase() == login.toLowerCase()
                            && (data.MDP.toLowerCase() == password.toLowerCase() || this.isAdmin())) {
                            this.activeCustomer$.next(data);
                            this.activeCustomer = data;
                            resolve(data);
                        }
                        else
                            reject('Mauvais identifiants');
                    })
                    .catch(error => reject(error));
            }
        });
    }

    isAdmin() {
        let index = 0;
        let admin = false;
        while(!admin && index < this.customerAccounts.length){
            if(this.customerAccounts[index].CT_Num == 'ADMIN')
                admin = true;
        }
        return admin;
    }

    private hashString(s:string){
        return sha256.sha256(s);
    }

    setUserArrayStorage(user: F_COMPTET): Promise<void> {
        if(this.customerAccounts == null)
            this.customerAccounts = [];
        return new Promise<void>( (resolve) => {
            let index = 0;
            let found = false;
            while(!found && index < this.customerAccounts.length)
                if(this.customerAccounts[index].CT_Num == user.CT_Num)
                    found = true;
                else
                    index++;
            if (!found) {
                this.addCustomer(user);
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

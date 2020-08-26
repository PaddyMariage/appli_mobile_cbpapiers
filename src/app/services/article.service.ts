import {Injectable} from '@angular/core';
import {Article} from '../models/Article';
import {HttpClient} from '@angular/common/http';
import {HTTP} from "@ionic-native/http/ngx";
import {BehaviorSubject} from "rxjs";
import {F_DOCLIGNE} from "../models/JSON/F_DOCLIGNE";
import {F_ARTICLE} from '../models/JSON/F_ARTICLE';
import {F_ARTCLIENT} from '../models/JSON/F_ARTCLIENT';

import {environment} from "../../environments/environment";
import {OrderLine} from "../models/OrderLine";
import {CartService} from "./cart.service";
import {ArticleFrequency} from "../models/JSON/custom/ArticleFrequency";

@Injectable({
    providedIn: 'root'
})
export class ArticleService {

    private article: Article;

    constructor(private http: HttpClient, private ionicHttp: HTTP, private cartService: CartService) {
    }

    setArticle(article: Article) {
        this.article = article;
    }

    getArticle() {
        return this.article;
    }

    /**
     * @param CT_Num
     *
     * Récupère toutes les doclignes d'un client pour calculer la fréquence à laquelle un article a été commandé.
     *
     * Crée dans un premier temps une liste d'article et de leur fréquence d'apparition dans les doclignes.
     * Puis les trie en ordre descendant.
     *
     * Crée ensuite un array d'OrderLine à partir de la liste précédente afin d'initier la liste d'articles
     * pour la page Article et la retourne dans la promesse.
     **/

    getDocLignes(CT_Num: string) {
        // créer un tableau d'objets qui contiendra l'AR_Ref (référence de l'article)
        // et la frequence (la fréquence d'apparition dans toutes les doclignes)
        let articlesAndFrequency: ArticleFrequency[] = [];

        // créer un tableau qui contiendra juste les AR_Ref uniques rencontrés, afin de trouver plus facilement
        // l'index plus tard dans le tableau articlesAndFrequency
        let AR_Ref_Array: string[] = [];

        // on instancie et initialise notre tableau d'OrderLine
        let orderLines: OrderLine[] = [];

        return new Promise((resolve) => {
            this.ionicHttp.get(environment.doclignesURL + CT_Num, {}, {})
                .then(F_DOCLIGNE => {

                    // on transforme la réponse du webservice en réponse exploitable
                    const F_DOCLIGNES: F_DOCLIGNE[] = JSON.parse(F_DOCLIGNE.data);

                    F_DOCLIGNES.forEach(
                        (DOCLIGNE) => {
                            if (DOCLIGNE.AR_Ref.trim() != '') {

                                const index = AR_Ref_Array.indexOf(DOCLIGNE.AR_Ref.trim());

                                if (index == -1) {
                                    // si l'index retourné est -1, on rencontre pour la première fois l'AR_Ref
                                    // on l'enregistre dans la liste d'AR_Ref
                                    AR_Ref_Array.push(DOCLIGNE.AR_Ref.trim());

                                    // on crée notre objet "AR_Ref et Fréquence"
                                    const newEntry = {
                                        AR_Ref: DOCLIGNE.AR_Ref.trim(),
                                        frequency: 1
                                    };
                                    // on l'enregistre dans notre liste
                                    articlesAndFrequency.push(newEntry);

                                } else {
                                    // sinon, on l'a déjà rencontré et on augmente la fréquence de +1
                                    articlesAndFrequency[index].frequency++;
                                }
                            }
                        }
                    );

                    // on trie la liste en ordre descendant, la plus haute fréquence apparaitra en premier
                    articlesAndFrequency.sort((a, b) => (b.frequency - a.frequency));

                    // à partir de cette liste on initialise notre liste d'orderLine pour la page en règlant
                    // les infos de départ (tout à 0 ou null sauf la référence (AR_Ref)
                    articlesAndFrequency.forEach(
                        article => {
                            const orderLine = {
                                article: {
                                    reference: article.AR_Ref,
                                    AC_PrixVen: 0,
                                    AC_Remise: 0
                                },
                                quantity: 0,
                                orderNumber: null,
                            };
                            orderLines.push(orderLine);
                        }
                    );

                    // on renvoie cette liste à la page.
                    resolve(orderLines);
                })
                .catch(error => {
                    console.log(error);
                });
        });
    }


    /**
     * @param orderLineList
     * @param CT_Num
     *
     * Récupère les informations de tarif d'exception et/ou de remise des articles du client (ARTCLIENT)
     * (chaque client en a de spécifiques) et enregistre ces informations pour chaque article
     *
     */

    getArtClients(orderLineList: OrderLine[], CT_Num: string) {
        return new Promise((resolve) => {
            this.ionicHttp.get(environment.artClientsURL + CT_Num, {}, {})
                .then(F_ARTCLIENT => {
                    const F_ARTCLIENTS: F_ARTCLIENT[] = JSON.parse(F_ARTCLIENT.data);

                    // on boucle sur les articles de l'array d'OrderLine
                    for (let orderLine of orderLineList) {

                        // on boucle sur les ARTCLIENT
                        for (const discount of F_ARTCLIENTS) {

                            // si on trouve une correspondance d'AR_Ref
                            if (discount.AR_Ref == orderLine.article.reference) {

                                // on règle les infos
                                const AC_PrixVen = discount.AC_PrixVen;
                                const AC_Remise = discount.AC_Remise;

                                orderLine.article.AC_PrixVen = AC_PrixVen;
                                orderLine.article.AC_Remise = AC_Remise;

                                // break permet de finir la boucle sur les ARTCLIENT plus tôt afin de passer
                                // au prochain article et de reboucler sur les artclient, au lieu d'atteindre
                                // la fin des artclient à chaque fois
                                break;
                            }
                        }
                    }
                })
                .catch(error => console.error(error))
                .finally(() => {
                    resolve(orderLineList);
                });
        });
    }

    /**
     *
     * @param orderLineList
     *
     * récupère tous les articles de la BDD et règle le prix des articles en fonction de ces 4 situations:
     *
     * a. Il existe un tarif d'exception et une remise -> prix = tarif d'exception - remise
     * b. Il existe uniquement un tarif d'exception -> prix = tarif d'exception
     * c. Il existe uniquement une remise -> prix = tarif de base - remise
     * d. Il n'existe pas de tarif d'exception ni de remise -> prix = tarif de base
     *
     * Le tarif d'exception et la remise viennent des ARTCLIENT.
     * Le tarif de base vient de la liste d'article de la BDD.
     * Tous les prix sont arrondis au centime supérieur.
     *
     * On récupère aussi les libellés des articles.
     **/

    getF_ARTICLE(orderLineList: OrderLine[]) {

        // on crée une liste "finale" afin de trier les articles dont le prix ne sera pas calculé
        // car la requête au webservice peut ne pas retourner certains articles suite à un filtre effectué
        // dans le backend
        let orderLineList_Final: OrderLine[] = [];

        return new Promise((resolve, reject) => {
            this.ionicHttp.get(environment.articlesURL + '/test-error', {}, {})
                .then((F_ARTICLE) => {
                    const F_ARTICLES: F_ARTICLE[] = JSON.parse(F_ARTICLE.data);

                    for (const orderline of orderLineList) {

                        for (const article of F_ARTICLES) {

                            // s'il y a correspondance et que la référence est différente de FC (qui n'est pas un article)
                            if (orderline.article.reference == article.AR_Ref.trim() && article.AR_Ref != 'FC') {

                                // on règle les prix selon les situations décrites plus haut
                                const AC_PrixVen = orderline.article.AC_PrixVen;
                                const AC_Remise = orderline.article.AC_Remise;

                                if (AC_PrixVen != 0 && AC_Remise != 0)
                                    orderline.article.unitPrice =
                                        Math.ceil(
                                            AC_PrixVen * (1 - AC_Remise / 100) * 100
                                        ) / 100;

                                else if (AC_PrixVen != 0 && AC_Remise == 0)
                                    orderline.article.unitPrice =
                                        Math.ceil(AC_PrixVen * 100) / 100;

                                else if (AC_PrixVen == 0 && AC_Remise != 0)
                                    orderline.article.unitPrice =
                                        Math.ceil(
                                            article.AR_PrixVen * (1 - AC_Remise / 100) * 100
                                        ) / 100;

                                else
                                    orderline.article.unitPrice =
                                        Math.ceil(article.AR_PrixVen * 100) / 100;

                                // on récup le libellé des articles au passage aussi
                                orderline.article.label = article.AR_Design;

                                // après avoir calculé le prix, on met l'article dans la liste "finale"
                                orderLineList_Final.push(orderline);
                            }
                        }
                    }
                })
                .catch(error => {
                    console.log('oops');
                    console.log(error)
                    reject('une erreur est survenue, veuillez recharger la page en swipant de haut en bas')

                })
                // on retourne la liste "finale"
                .finally(() => resolve(orderLineList_Final));

        });
    }
}


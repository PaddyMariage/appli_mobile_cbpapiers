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

@Injectable({
    providedIn: 'root'
})
export class ArticleService {

    private article: Article;
    public articles$: BehaviorSubject<F_ARTICLE[]> = new BehaviorSubject<F_ARTICLE[]>([]);
    public articlePrice$: BehaviorSubject<F_ARTCLIENT[]> = new BehaviorSubject<F_ARTCLIENT[]>([]);

    constructor(private http: HttpClient, private ionicHttp: HTTP, private cartService: CartService) {
    }

    setArticle(article: Article) {
        this.article = article;
    }

    getArticle() {
        return this.article;
    }

    getDocLignes(CT_Num: string) {
        let articlesAndFrequency: [string, number][] = [];

        let AR_Ref_Array: string[] = [];
        let orderLines: OrderLine[] = [];
        return new Promise((resolve) => {
            this.ionicHttp.get(environment.doclignesURL + CT_Num, {}, {})
                .then(F_DOCLIGNE => {
                    const data: F_DOCLIGNE[] = JSON.parse(F_DOCLIGNE.data);
                    data.forEach(
                        (DOCLIGNE) => {
                            if (DOCLIGNE.AR_Ref.trim() != '')

                                if (AR_Ref_Array.indexOf(DOCLIGNE.AR_Ref.trim()) != -1)
                                    articlesAndFrequency[AR_Ref_Array.indexOf(DOCLIGNE.AR_Ref.trim())][1]++;

                                else {
                                    AR_Ref_Array.push(DOCLIGNE.AR_Ref.trim());
                                    articlesAndFrequency.push([DOCLIGNE.AR_Ref.trim(), 1]);
                                }
                        }
                    );
                    articlesAndFrequency.sort((a, b) => (b[1] - a[1]));
                    articlesAndFrequency.forEach(
                        data => {
                            const orderLine = {
                                article: {
                                    reference: data[0],
                                    AC_PrixVen: 0,
                                    AC_Remise: 0
                                },
                                quantity: 0,
                                orderNumber: null,
                            };
                            orderLines.push(orderLine);
                        }
                    );
                    resolve(orderLines);
                })
                .catch(error => {
                    console.log(error);
                });
        });
    }


    getArtClients(orderLineList: OrderLine[], CT_Num: string) {
        return new Promise((resolve) => {
            this.ionicHttp.get(environment.artClientsURL + CT_Num, {}, {})
                .then(F_ARTCLIENT => {
                    const data = JSON.parse(F_ARTCLIENT.data);
                    for (let orderLine of orderLineList) {

                        for (const discount of data) {

                            if (discount.AR_Ref == orderLine.article.reference) {

                                const AC_PrixVen = discount.AC_PrixVen;
                                const AC_Remise = discount.AC_Remise;

                                if (AC_PrixVen != 0 && AC_Remise != 0) {
                                    orderLine.article.AC_PrixVen = AC_PrixVen;
                                    orderLine.article.AC_Remise = AC_Remise;

                                } else if (AC_PrixVen != 0 && AC_Remise == 0)
                                    orderLine.article.AC_PrixVen = AC_PrixVen;

                                else if (AC_PrixVen == 0 && AC_Remise != 0)
                                    orderLine.article.AC_Remise = AC_Remise;

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

    getF_ARTICLE(orderLineList: OrderLine[]) {

        return new Promise((resolve) => {
            this.ionicHttp.get(environment.articlesURL, {}, {})
                .then((F_ARTICLE) => {
                    const data = JSON.parse(F_ARTICLE.data);

                    for (const orderline of orderLineList) {

                        for (const article of data) {

                            if (orderline.article.reference == article.AR_Ref.trim()) {
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
                                orderline.article.label = article.AR_Design;
                            }
                        }
                    }
                })
                .catch(error => {
                    console.log('oops');
                    console.log(error)
                })
                .finally(() => resolve(orderLineList));

        });
        // return new Promise((resolve, reject) => {
        //     this.http.get<F_ARTICLE[]>('assets/F_ARTICLE.json').subscribe(
        //         (F_ARTICLES: F_ARTICLE[]) => {
        //             for (const orderline of orderLineList) {
        //
        //                 for (const article of F_ARTICLES) {
        //
        //                     if (orderline.article.reference == article.AR_Ref.trim()) {
        //                         const AC_PrixVen = orderline.article.AC_PrixVen;
        //                         const AC_Remise = orderline.article.AC_Remise;
        //
        //                         if (AC_PrixVen != 0 && AC_Remise != 0)
        //                             orderline.article.unitPrice =
        //                                 Math.ceil(
        //                                     AC_PrixVen * (1 - AC_Remise / 100) * 100
        //                                 ) / 100;
        //
        //                         else if (AC_PrixVen != 0 && AC_Remise == 0)
        //                             orderline.article.unitPrice =
        //                                 Math.ceil(AC_PrixVen * 100) / 100;
        //
        //                         else if (AC_PrixVen == 0 && AC_Remise != 0)
        //                             orderline.article.unitPrice =
        //                                 Math.ceil(
        //                                     parseFloat(article.AR_PrixVen.replace(',', '.')) * (1 - AC_Remise / 100) * 100
        //                                 ) / 100;
        //
        //                         else
        //                             orderline.article.unitPrice =
        //                                 Math.ceil(parseFloat(article.AR_PrixVen.replace(',', '.')) * 100) / 100;
        //                     }
        //                 }
        //             }
        //         },
        //         error => console.log(error),
        //         () => {
        //             this.cartService.initOrderLinesList(orderLineList);
        //             resolve(orderLineList);
        //         }
        //     );
        // });
    }
}


import {Injectable} from '@angular/core';
import {Article} from '../models/Article';
import {HttpClient} from '@angular/common/http';
import {F_ARTICLE} from '../models/JSON/F_ARTICLE';
import {BehaviorSubject} from "rxjs";
import {F_ARTCLIENT} from '../models/JSON/F_ARTCLIENT';
import {HTTP} from "@ionic-native/http/ngx";
import {environment} from "../../environments/environment";
import {OrderLine} from "../models/OrderLine";

@Injectable({
    providedIn: 'root'
})
export class ArticleService {

    private article: Article;
    public articles$: BehaviorSubject<F_ARTICLE[]> = new BehaviorSubject<F_ARTICLE[]>([]);
    public articlePrice$: BehaviorSubject<F_ARTCLIENT[]> = new BehaviorSubject<F_ARTCLIENT[]>([]);

    constructor(private http: HttpClient, private ionicHttp: HTTP) {
    }

    setArticle(article: Article) {
        this.article = article;
    }

    getArticle() {
        return this.article;
    }

    getF_ARTCLIENT(orderLineList: OrderLine[]) {
        return new Promise((resolve) => {
            this.ionicHttp.get(environment.artClientsURL, {}, {})
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

        // return new Promise((resolve) => {
        //     this.ionicHttp.get(environment.articlesURL, {}, {})
        //         .then((F_ARTICLE) => {
        //             const data = JSON.parse(F_ARTICLE.data);
        //             console.log('articles?', data);
        //             for (const orderline of orderLineList) {

        //                 for (const article of data) {

        //                     if (orderline.article.reference == article.AR_Ref.trim()) {
        //                         const AC_PrixVen = orderline.article.AC_PrixVen;
        //                         const AC_Remise = orderline.article.AC_Remise;

        //                         if (AC_PrixVen != 0 && AC_Remise != 0)
        //                             orderline.article.unitPrice =
        //                                 Math.ceil(
        //                                     AC_PrixVen * (1 - AC_Remise / 100) * 100
        //                                 ) / 100;

        //                         else if (AC_PrixVen != 0 && AC_Remise == 0)
        //                             orderline.article.unitPrice =
        //                                 Math.ceil(AC_PrixVen * 100) / 100;

        //                         else if (AC_PrixVen == 0 && AC_Remise != 0)
        //                             orderline.article.unitPrice =
        //                                 Math.ceil(
        //                                     article.AR_PrixVen * (1 - AC_Remise / 100) * 100
        //                                 ) / 100;

        //                         else
        //                             orderline.article.unitPrice =
        //                                 Math.ceil(article.AR_PrixVen * 100) / 100;
        //                     }
        //                 }
        //             }
        //         })
        //         .catch(error => {
        //             console.log('oops');
        //             console.log(error)
        //         })
        //         .finally(() => resolve(orderLineList))
        //     ;

        // });
        return new Promise((resolve, reject) => {
            this.http.get<F_ARTICLE[]>('assets/F_ARTICLE.json').subscribe(
                (F_ARTICLES: F_ARTICLE[]) => {
                    for (const orderline of orderLineList) {

                        for (const article of F_ARTICLES) {

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
                                            parseFloat(article.AR_PrixVen.replace(',', '.')) * (1 - AC_Remise / 100) * 100
                                        ) / 100;

                                else
                                    orderline.article.unitPrice =
                                        Math.ceil(parseFloat(article.AR_PrixVen.replace(',', '.')) * 100) / 100;
                            }
                        }
                    }
                },
                error => console.log(error),
                () => resolve(orderLineList)
            );
        });
    }
}


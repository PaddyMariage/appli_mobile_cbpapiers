import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {SingleArticlePageRoutingModule} from './single-article-routing.module';

import {SingleArticlePage} from './single-article.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        SingleArticlePageRoutingModule
    ],
    declarations: [SingleArticlePage]
})
export class SingleArticlePageModule {
}

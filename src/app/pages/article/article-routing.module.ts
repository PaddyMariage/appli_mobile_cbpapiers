import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {ArticlePage} from './article.page';
import {AuthGuard} from "../../security/auth-guard.guard";

const routes: Routes = [
    {
        path: '',
        component: ArticlePage
    },
    {
        path: 'single-article',
        loadChildren: () => import('../single-article/single-article.module').then(m => m.SingleArticlePageModule),
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ArticlesPageRoutingModule {
}

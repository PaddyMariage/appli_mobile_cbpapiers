import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {AuthGuard} from "./security/auth-guard.guard";

const routes: Routes = [
    // todo mettre le authguard partout sauf login
    { // Actuellement on se sert du rooting de tabs (nav) ici pour ce qui est comamnde etc.
        path: 'nav',
        loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule),
    },
    {
        path: 'login',
        loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
    },
    {
        path: 'acc-choice',
        loadChildren: () => import('./pages/acc-choice/acc-choice.module').then(m => m.AccChoicePageModule),
        canActivate:[AuthGuard]
    },
    {
        path: 'administration',
        loadChildren: () => import('./pages/administration/administration.module').then(m => m.AdministrationPageModule),
        canActivate: [AuthGuard]
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}

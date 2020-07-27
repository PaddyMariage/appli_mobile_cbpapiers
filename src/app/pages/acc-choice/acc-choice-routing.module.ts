import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccChoicePage } from './acc-choice.page';
import { SettingsPage } from '../settings/settings.page';

const routes: Routes = [
  {
    path: '',
    component: AccChoicePage
  },
  {
    path: 'settings',
    loadChildren: () => import('../settings/settings.module').then( m => m.SettingsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccChoicePageRoutingModule {}
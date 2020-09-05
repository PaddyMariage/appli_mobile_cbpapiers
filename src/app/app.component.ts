import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import {Storage} from "@ionic/storage";
import {UserService} from "./services/user.service";
import {StorageOrderLines} from "./models/custom/StorageOrderLines";
import {CartService} from "./services/cart.service";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private platForm : Platform,
    private router : Router,
    private storage: Storage,
    private userService: UserService,
    private cartService: CartService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      // j'initialise toutes les donnees avec les storage et je redirige en fonction
      // de ce qui a ete recup dans le storage
      this.storage.ready().then(async () => {
        this.userService.initActiveUserFromStorage().then(() => {
          this.userService.initAllUsersFromStorage().then(() => {
            if (this.userService.getActiveCustomer() != null)
            this.router.navigateByUrl('/nav/article');
            else if (this.userService.getCustomerAccounts().length > 1)
              this.router.navigateByUrl('/acc-choice');
          });
        });
      });
    });
  }
}

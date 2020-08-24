import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {FormsModule} from "@angular/forms";
import {IonicStorageModule} from '@ionic/storage';
import {HttpClientModule} from '@angular/common/http';



//imports nécessaires pour générer pdf et créer un mail
import {File} from '@ionic-native/file/ngx';
import {FileOpener} from '@ionic-native/file-opener/ngx';
import {EmailComposer} from '@ionic-native/email-composer/ngx';
import {UserService} from "./services/user.service";
import {HTTP} from "@ionic-native/http/ngx";

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, IonicModule.forRoot(), IonicStorageModule.forRoot(), AppRoutingModule, FormsModule, HttpClientModule],
    providers: [
        StatusBar,
        SplashScreen,
        UserService,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        File, FileOpener, EmailComposer, HTTP
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

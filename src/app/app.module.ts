import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {IonicStorageModule} from '@ionic/storage';
import {HttpClientModule} from '@angular/common/http';
import {UserService} from "./services/user.service";
import {HTTP} from "@ionic-native/http/ngx";
import {Keyboard} from '@ionic-native/keyboard/ngx';

//imports nécessaires pour générer pdf et créer un mail
import {File} from '@ionic-native/file/ngx';
import {FileOpener} from '@ionic-native/file-opener/ngx';
import {EmailComposer} from '@ionic-native/email-composer/ngx';
import {Camera} from "@ionic-native/camera/ngx";
import {Crop} from "@ionic-native/crop/ngx";


@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule,
        IonicModule.forRoot(),
        IonicStorageModule.forRoot(),
        AppRoutingModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        FormsModule],
    providers: [
        StatusBar,
        SplashScreen,
        UserService,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        File, FileOpener, EmailComposer, HTTP, Keyboard, Camera, Crop
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {Storage} from "@ionic/storage";

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    access: boolean;

    constructor(private router: Router,
                private storage: Storage) {
    }

    async canActivate() {
        // todo peut etre a modifier dans le futur pour ne plus prendre en compte la longueur du storage<
        await this.storage.get('logged').then((logged:string) => {
            console.log(logged);
            this.access = (logged != null);
        }).catch(() => {
            this.access = false;
        })

        await this.storage.length().then((length) => {
            if(length == 0)
                this.access = false;
            }
        )
        if (this.access == false) {
            await this.router.navigateByUrl('/login');
            return this.access;
        } else
            return this.access;
    }
}

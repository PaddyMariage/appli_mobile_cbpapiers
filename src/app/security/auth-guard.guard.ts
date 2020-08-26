import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {Storage} from "@ionic/storage";
import {UserService} from "../services/user.service";

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    access: boolean;

    constructor(private router: Router,
                private storage: Storage,
                private userService: UserService) {
    }

    async canActivate() {
        this.access = this.userService.getActiveCustomer() != null;

        if (this.access == false) {
            await this.router.navigateByUrl('/login');
            return this.access;
        } else
            return this.access;
    }
}

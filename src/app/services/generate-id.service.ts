import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class GenerateIDService {
    public ids: string[] = [];

    constructor() {
    }

    public generate(): string {
        let isUnique = false;
        let tempId = '';

        while (!isUnique) {
            tempId = this.generator();
            if (!this.idExists(tempId)) {
                isUnique = true;
                this.ids.push(tempId);
            }
        }

        return tempId;
    }

    public remove(id: string): void {
        const index = this.ids.indexOf(id);
        this.ids.splice(index, 1);
    }

    // format de génération du numéro de commande : MOBI- suivi de 4 chiffres générées aléatoirement
    private generator(): string {
        return 'MOBI-' + `${this.S4()}`;
    }

    private idExists(id: string): boolean {
        return this.ids.includes(id);
    }

    private S4(): number {
        // tslint:disable-next-line:no-bitwise
        return (((1 + Math.random()) * 0x1000) | 0);
    }
}

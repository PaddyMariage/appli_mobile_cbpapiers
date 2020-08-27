import {Component, OnInit} from '@angular/core';
import {AnimationController, ModalController} from '@ionic/angular';
import {CallNumber} from '@ionic-native/call-number/ngx';

@Component({
    selector: 'app-contact',
    templateUrl: './contact.page.html',
    styleUrls: ['./contact.page.scss'],
    providers: [CallNumber]
})
export class ContactPage implements OnInit {
    // import d'AnimationController servant à créer une animation custom
    constructor(public modalController: ModalController,
                public animationCtrl: AnimationController,
                private callNumber: CallNumber
    ) {
    }

    ngOnInit() {
    }

    // création de la modal
    async presentModal() {
        const enterAnimation = (baseEl: any) => {
            // création de l'animation via AnimationControleur
            const backdropAnimation = this.animationCtrl.create()
                .addElement(baseEl.querySelector('ion-backdrop'));

            // définition des paramétres de l'animation
            const wrapperAnimation = this.animationCtrl.create()
                .addElement(baseEl.querySelector('.modal-wrapper'));

            // la méthode fromTo permet de dire de quels parametres ça commence / ça fini
            wrapperAnimation.fromTo('transform', 'scaleX(0.1) scaleY(0,1)', 'translateX(0%) scaleX(1) scaleY(1)')
                .fromTo('opacity', 0, 1);

            backdropAnimation.fromTo('opacity', 0.01, 0.4);

            // on retourne l'animation crer avec ses différents élément
            return this.animationCtrl.create()
                .addElement(baseEl)
                .easing('cubic-bezier(0.36,0.66,0.04,1)')
                .duration(400)
                .beforeAddClass('show-modal')
                .addAnimation([backdropAnimation, wrapperAnimation]);
        };

        // pour l'animation de retour, on joue simplement l'inverse de l'animation d'entrée
        const leaveAnimation = (baseEl: any) => {
            return enterAnimation(baseEl).direction('reverse');
        };

        // Création du modal avec les animations et les css défini
        const modal = await this.modalController.create({
            component: ContactPage,
            enterAnimation,
            leaveAnimation,
            backdropDismiss: true,
            cssClass: 'modal-pop'
        });

        // apparition du modal
        return await modal.present();
    }

    // Pour que l'appel fonctionne, il fallait ajouter CallNumber au provider dans cette
    // page et non dans app.module.ts sous peine d'une erreur. Besoin d'android pour tester
    onClickJerome() {
        this.callNumber.callNumber("0676411829", true)
            .then(res => console.log('Numéro composé', res))
            .catch(err => console.log('Composition échoué', err));
    }

    onClickXavier() {
        this.callNumber.callNumber("0607950620", true)
            .then(res => console.log('Numéro composé', res))
            .catch(err => console.log('Composition échoué', err));
    }

    onClickJulien() {
        this.callNumber.callNumber("0607547499", true)
            .then(res => console.log('Numéro composé', res))
            .catch(err => console.log('Composition échoué', err));
    }

}

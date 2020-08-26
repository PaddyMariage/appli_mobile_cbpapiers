import {Component} from '@angular/core';
import {ContactPage} from '../contact/contact.page';
import {AnimationController, ModalController} from '@ionic/angular';

@Component({
    selector: 'app-tabs',
    templateUrl: './tabs.page.html',
    styleUrls: ['./tabs.page.scss'],
})
export class TabsPage {

    constructor(public modalController: ModalController,
                public animationCtrl: AnimationController) {
    }

    // creation de la modal
    async popUpModal() {
        const enterAnimation = (baseEl: any) => {
            // création de l'animation via AnimationControleur
            const backdropAnimation = this.animationCtrl.create()
                .addElement(baseEl.querySelector('ion-backdrop'));

            // définition des paramétres de l'animation
            const wrapperAnimation = this.animationCtrl.create()
                .addElement(baseEl.querySelector('.modal-wrapper'));

            // la méthode fromTo permet de dire de quels parametres ça commence / ça fini
            wrapperAnimation.fromTo('transform', 'scaleX(0.1) scaleY(0.1)', 'translateX(0%) scaleX(1) scaleY(1)')
                .fromTo('opacity', 0, 1);

            backdropAnimation.fromTo('opacity', 0.01, 0.4);

            // on retourne l'animation avec ses différents éléments
            return this.animationCtrl.create()
                .addElement(baseEl)
                .easing('cubic-bezier(0.36,0.66,0.04,1)')
                .duration(300)
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
            cssClass: 'modal-pop'
        });

        // lancement du modal
        return await modal.present();
    }
}

import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import * as firebase from 'firebase/compat/app';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import fire from 'firebase/compat/app';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: Observable<User>;
  user: User;

  constructor(
    private angularFirestore: AngularFirestore,
    private angularFireAuth: AngularFireAuth,
    private router: Router,
    private LoadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.user$ = this.angularFireAuth.authState.pipe(
      switchMap((user) => {
        if (user) {
          return this.angularFirestore
            .doc<User>(`user/${user.uid}`)
            .valueChanges();
        } else {
          return of(null);
        }
      })
    );
  } // end of constructor

  async signIn(email, password) {
    try {
      const loading = await this.LoadingController.create({
        message: 'Verificando...',
        spinner: 'crescent',
        showBackdrop: true,
      });

      loading.present();

      this.angularFireAuth
        .setPersistence(firebase.default.auth.Auth.Persistence.LOCAL)
        .then(() => {
          this.angularFireAuth
            .signInWithEmailAndPassword(email, password)
            .then((data) => {
              loading.dismiss();
              this.router.navigate(['/home']);
            })
            .catch((error) => {
              loading.dismiss();
              this.toast(this.createMessage(error.code), 'danger');
            });
        })
        .catch((error) => {
          loading.dismiss();
          this.toast(error.message, 'danger');
        });
    } catch (error) {
      console.log(error.message);
    }
  } // end of signIn

  registerNewUser(newUser: User) {
    this.angularFireAuth
      .createUserWithEmailAndPassword(newUser.userEmail, newUser.userPassword)
      .then((data) => {
        this.angularFirestore
          .collection('user')
          .doc(data.user?.uid)
          .set({
            userId: newUser.userId,
            userName: newUser.userName,
            userEmail: newUser.userEmail,
            userRol: newUser.userRol,
            userSex: newUser.userSex,
          })
          .then(() => {
            this.toast('Registrado!!', 'success');
          })
          .catch((error) => {
            this.toast(this.createMessage(error.code), 'danger');
          });
      })
      .catch((error) => {
        this.toast(this.createMessage(error.code), 'danger');
      });
  } // end of registerNewUser

  async signOut() {
    try {
      const loading = await this.LoadingController.create({
        message: "Cerrando sesión...",
        spinner: 'crescent',
        showBackdrop: true,
      });
      loading.present();

      this.angularFireAuth.signOut().then(() => {
        setTimeout(() => {
          loading.dismiss();
          this.router.navigate(['/login']);
        }, 2000);
      });
    } catch (error) {
      console.log(error.message);
    }
  } // end of signOut

  getUserLogged() {
    return this.angularFireAuth.authState;
  } // end of getUserLogged

  async toast(message, status) {
    try {
      const toast = await this.toastController.create({
        message: message,
        color: status,
        position: 'top',
        duration: 2000,
      });
      toast.present();
    } catch (error) {
      console.log(error.message);
    }
  } // end of toast

  private createMessage(errorCode: string): string {
    let message: string = '';
    switch (errorCode) {
      case 'auth/internal-error':
        message = 'Los campos estan vacios';
        break;
      case 'auth/operation-not-allowed':
        message = 'La operación no está permitida.';
        break;
      case 'auth/email-already-in-use':
        message = 'El email ya está registrado.';
        break;
      case 'auth/invalid-email':
        message = 'El email no es valido.';
        break;
      case 'auth/weak-password':
        message = 'La contraseña debe tener al menos 6 caracteres';
        break;
      case 'auth/user-not-found':
        message = 'No existe ningún usuario con estos identificadores';
        break;
      default:
        message = 'Dirección de email y/o contraseña incorrectos';
        break;
    }

    return message;
  } // end of createMessage
}

import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userData: any;

  constructor(
    public afAuth: AngularFireAuth,
    public router: Router,
    public ngZone: NgZone,
  ) {}

  //sign in function
  SignIn(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  //singup function
  SignUp(email: string, password: string) {
    return this.afAuth
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        this.SendVerificationMail();
      })
      .catch((error: any) => {
        throw error;
      });
  }

  ForgotPassword(passwordResetEmail: string) {
    return this.afAuth
      .sendPasswordResetEmail(passwordResetEmail)
      .then(() => {
        return true;
      })
      .catch((error: any) => {
        throw error;
      });
  }

  SendVerificationMail() {
    this.afAuth.currentUser.then((user) => {
      if (user) {
        return user.sendEmailVerification();
      }
    });
  }

  SignOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['/auth/login']);
    });
  }

  // change password function
  ChangePassword(currentPassword: string, newPassword: string) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const user = await this.afAuth.currentUser;
        if (!user || !user.email) {
          reject('User not found');
          return;
        }

        // Re-authenticate user (required before changing password)
        try {
          const credential = await this.afAuth.signInWithEmailAndPassword(user.email, currentPassword);
          
          if (credential.user) {
            await credential.user.updatePassword(newPassword);
            resolve();
          } else {
            reject('Unable to update password');
          }
        } catch (error: any) {
          reject('Current password is incorrect');
        }
      } catch (error: any) {
        reject(error.message);
      }
    });
  }

  get isLoggedIn(): boolean {
    const localStorageUser: any = localStorage.getItem('user');
    const user = JSON.parse(localStorageUser);
    return user != null && user.emailVerified != false ? true : false;
  }
}
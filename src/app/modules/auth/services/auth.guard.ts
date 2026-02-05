import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard {

  constructor(private authService: AuthService) { }

  canActivate() {
    const currentUser = localStorage.getItem("user");
    if (currentUser) {
      return true;
    }

    this.authService.SignOut();
    return false;
  }
}

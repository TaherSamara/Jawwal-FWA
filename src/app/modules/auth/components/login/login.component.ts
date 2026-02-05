import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  message: string;
  messageType: string;
  isLoginLoading: boolean = false;

  constructor(private fb: FormBuilder, private router: Router, private ngZone: NgZone,
    private authService: AuthService, private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  showMsg(success: boolean, msg: string) {
    this.message = msg;
    this.messageType = success ? 'success' : 'danger';
    this.changeDetectorRef.detectChanges();
  }

  submit() {
    this.showMsg(false, '');
    this.isLoginLoading = true;
    this.authService.SignIn(this.f.email.value, this.f.password.value)
      .then((result: any) => {
        if (result.user.emailVerified !== true) {
          this.authService.SendVerificationMail();
          this.showMsg(false, "Please verify your email.");
          this.isLoginLoading = false;
        } else {
          this.ngZone.run(() => {
            localStorage.setItem("user", JSON.stringify(result.user));
            this.router.navigate(["/"]);
          });
        }
      }).catch(() => {
        this.showMsg(false, "You have entered the wrong email or password.");
        this.isLoginLoading = false;
      });
  }
}
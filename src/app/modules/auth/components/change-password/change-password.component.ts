import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  message: string = '';
  messageType: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.changePasswordForm = this.fb.group(
      {
        currentPassword: [null, Validators.required],
        newPassword: [null, [Validators.required, Validators.minLength(6)]],
        confirmPassword: [null, Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  get f() {
    return this.changePasswordForm.controls;
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword.value === confirmPassword.value
      ? null
      : { passwordMismatch: true };
  }

  showMsg(success: boolean, msg: string) {
    this.message = msg;
    this.messageType = success ? 'success' : 'danger';
    this.changeDetectorRef.detectChanges();
  }

  submit() {
    if (this.changePasswordForm.invalid) {
      this.showMsg(false, 'Please fill all fields correctly');
      return;
    }

    this.showMsg(false, '');
    this.isLoading = true;

    const { currentPassword, newPassword } = this.changePasswordForm.value;

    this.authService
      .ChangePassword(currentPassword, newPassword)
      .then(() => {
        this.showMsg(true, 'Password changed successfully!');
        this.changePasswordForm.reset();
        this.isLoading = false;

        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      })
      .catch((error: any) => {
        this.showMsg(false, error || 'Failed to change password');
        this.isLoading = false;
      });
  }
}

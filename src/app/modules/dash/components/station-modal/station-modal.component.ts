import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Station } from '../../models/station.model';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-station-modal',
  templateUrl: './station-modal.component.html',
})
export class StationModalComponent implements OnInit {
  @Input() station: Station | undefined;
  @Input() isEditMode: boolean = false;

  form!: FormGroup;
  isSubmitting: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private activeModal: NgbActiveModal,
    private firebaseService: FirebaseService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initialize the form
   */
  initializeForm(): void {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
    });

    if (this.isEditMode && this.station) {
      this.form.patchValue({
        name: this.station.name,
      });
    }
  }

  /**
   * Submit form
   */
  onSubmit(): void {
    if (!this.form.valid) return;

    this.isSubmitting = true;
    const formValue = this.form.getRawValue();

    // Get current user from localStorage and extract username from email
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const currentUser = this.extractUsernameFromEmail(user?.email || 'Admin');

    if (this.isEditMode && this.station) {
      this.firebaseService
        .updateStation(this.station.key, {
          name: formValue.name,
          updatedBy: currentUser,
        })
        .then(() => {
          this.activeModal.close();
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.isSubmitting = false;
        });
    } else {
      this.firebaseService
        .createStation({ name: formValue.name, createdBy: currentUser })
        .then(() => {
          this.activeModal.close();
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          this.isSubmitting = false;
        });
    }
  }

  /**
   * Extract username from email and remove numbers
   * Example: tahersamara07@gmail.com -> tahersamara
   */
  private extractUsernameFromEmail(email: string): string {
    // Get the part before @
    const username = email.split('@')[0];
    // Remove all numbers
    return username.replace(/\d+/g, '');
  }

  /**
   * Close modal
   */
  onCancel(): void {
    this.activeModal.dismiss();
  }
}

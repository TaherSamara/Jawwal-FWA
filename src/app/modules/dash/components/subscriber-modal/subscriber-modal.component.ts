import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SERVICE_TYPES } from '../../models/enums';
import { Subscriber } from '../../models/subscriber.model';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-subscriber-modal',
  templateUrl: './subscriber-modal.component.html',
})
export class SubscriberModalComponent implements OnInit {
  @Input() stationName: string = '';
  @Input() subscriber: Subscriber | undefined;
  @Input() isEditMode: boolean = false;

  form!: FormGroup;
  serviceTypes = SERVICE_TYPES;
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
      serviceType: ['Mobadara'], // Default value set to Mobadara
      subscriberName: ['', Validators.required],
      lineCode: ['', Validators.required],
      linkMacAddress: [''],
      unitType: [''],
      unitDirection: [''],
      managementIP: [''],
      mikrotikID: [''],
      mikrotikMacAddress: [''],
      sasName: [''],
      sasPort: [''],
      odfName: [''],
      odfPort: [''],
      managementVlan: [''],
    });

    if (this.isEditMode && this.subscriber) {
      this.form.patchValue({
        serviceType: this.subscriber.serviceType,
        subscriberName: this.subscriber.subscriberName,
        lineCode: this.subscriber.lineCode,
        linkMacAddress: this.subscriber.linkMacAddress,
        unitType: this.subscriber.unitType,
        unitDirection: this.subscriber.unitDirection,
        managementIP: this.subscriber.managementIP,
        mikrotikID: this.subscriber.mikrotikID,
        mikrotikMacAddress: this.subscriber.mikrotikMacAddress,
        sasName: this.subscriber.sasName,
        sasPort: this.subscriber.sasPort,
        odfName: this.subscriber.odfName,
        odfPort: this.subscriber.odfPort,
        managementVlan: this.subscriber.managementVlan,
      });
    }
  }

  /**
   * Submit form
   */
  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;
    const formValue = this.form.value;

    // Get current user from localStorage and extract username from email
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const currentUser = this.extractUsernameFromEmail(user?.email || 'Admin');

    if (this.isEditMode && this.subscriber) {
      // UPDATE MODE: Only update data and updatedBy
      const updateData = {
        stationName: this.stationName,
        serviceType: formValue.serviceType,
        subscriberName: formValue.subscriberName,
        lineCode: formValue.lineCode,
        linkMacAddress: formValue.linkMacAddress,
        unitType: formValue.unitType,
        unitDirection: formValue.unitDirection,
        managementIP: formValue.managementIP,
        mikrotikID: formValue.mikrotikID,
        mikrotikMacAddress: formValue.mikrotikMacAddress,
        sasName: formValue.sasName,
        sasPort: formValue.sasPort,
        odfName: formValue.odfName,
        odfPort: formValue.odfPort,
        managementVlan: formValue.managementVlan,
        updatedBy: currentUser,
      };

      this.firebaseService
        .updateSubscriber(this.subscriber.key, updateData)
        .then(() => {
          this.activeModal.close();
        })
        .catch((error: any) => {
          console.error('Error updating subscriber:', error);
          this.isSubmitting = false;
        });
    } else {
      // CREATE MODE: Set all data with createdBy and updatedBy initially set to same user
      const createData = {
        stationName: this.stationName,
        serviceType: formValue.serviceType,
        subscriberName: formValue.subscriberName,
        lineCode: formValue.lineCode,
        linkMacAddress: formValue.linkMacAddress,
        unitType: formValue.unitType,
        unitDirection: formValue.unitDirection,
        managementIP: formValue.managementIP,
        mikrotikID: formValue.mikrotikID,
        mikrotikMacAddress: formValue.mikrotikMacAddress,
        sasName: formValue.sasName,
        sasPort: formValue.sasPort,
        odfName: formValue.odfName,
        odfPort: formValue.odfPort,
        managementVlan: formValue.managementVlan,
        createdBy: currentUser,
      };

      this.firebaseService
        .createSubscriber(createData)
        .then(() => {
          this.activeModal.close();
        })
        .catch((error: any) => {
          console.error('Error creating subscriber:', error);
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

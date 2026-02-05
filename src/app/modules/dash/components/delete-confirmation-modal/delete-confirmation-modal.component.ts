import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-delete-confirmation-modal',
  templateUrl: './delete-confirmation-modal.component.html',
  styleUrls: ['./delete-confirmation-modal.component.css'],
})
export class DeleteConfirmationModalComponent {
  @Input() itemName: string = 'Item'; // اسم العنصر المراد حذفه
  @Input() itemType: string = 'Station'; // نوع العنصر (Station/Subscriber)
  @Input() isDeleting: boolean = false; // حالة الحذف

  constructor(public activeModal: NgbActiveModal) {}

  /**
   * تأكيد الحذف
   */
  confirmDelete(): void {
    this.isDeleting = true;
    this.activeModal.close(true);
  }

  /**
   * إلغاء الحذف
   */
  cancelDelete(): void {
    this.activeModal.dismiss(false);
  }
}

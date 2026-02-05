import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PingResponse, PingService } from '../../services/ping.service';

@Component({
  selector: 'app-ping',
  templateUrl: './ping.component.html',
  styleUrls: ['./ping.component.css'],
})
export class PingComponent implements OnInit {
  @ViewChild('pingModal') pingModalTemplate!: TemplateRef<any>;

  host: string = '';
  count: number = 5;
  isLoading: boolean = false;
  pingResult: PingResponse | null = null;
  error: string | null = null;
  modalRef: NgbModalRef | null = null;

  constructor(
    private pingService: PingService,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {}

  /**
   * Execute ping and show results in modal
   */
  executePing(): void {
    if (!this.host.trim()) {
      this.error = 'Please enter a host or IP address';
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.pingResult = null;

    // Open modal before ping starts
    this.openModal();

    this.pingService.ping(this.host, this.count).subscribe({
      next: (response: PingResponse) => {
        this.pingResult = response;
        this.isLoading = false;

        // If the backend returned an error, display it
        if (response.error && response.error.trim()) {
          this.error = response.error;
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Ping error:', error);

        // Handle different error types
        if (error.status === 0) {
          this.error =
            'Network error: Unable to reach the server. Please check your connection.';
        } else if (error.status === 404) {
          this.error = 'API endpoint not found';
        } else if (error.status === 500) {
          this.error =
            'Server error: ' + error.error?.message || 'Unknown error';
        } else {
          this.error =
            error.error?.error ||
            error.error?.message ||
            'Error executing ping: ' + error.statusText;
        }

        this.pingResult = null;
      },
    });
  }

  /**
   * Open the modal
   */
  openModal(): void {
    this.modalRef = this.modalService.open(this.pingModalTemplate, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
    });
  }

  /**
   * Close the modal
   */
  closeModal(): void {
    if (this.modalRef) {
      this.modalRef.dismiss();
      this.modalRef = null;
    }
  }

  /**
   * Reset form
   */
  resetForm(): void {
    this.host = '';
    this.count = 5;
    this.pingResult = null;
    this.error = null;
    this.isLoading = false;
  }
}

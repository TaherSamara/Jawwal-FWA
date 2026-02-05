import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { DeleteConfirmationModalComponent } from '../../components/delete-confirmation-modal/delete-confirmation-modal.component';
import { SubscriberModalComponent } from '../../components/subscriber-modal/subscriber-modal.component';
import { SERVICE_TYPES, ServiceType } from '../../models/enums';
import { Station } from '../../models/station.model';
import {
  Subscriber,
  SubscribersByServiceType,
} from '../../models/subscriber.model';
import { FirebaseService } from '../../services/firebase.service';
import { PingService } from '../../services/ping.service';

@Component({
  selector: 'app-station-details',
  templateUrl: './station-details.component.html',
  styleUrls: ['./station-details.component.css'],
})
export class StationDetailsComponent implements OnInit {
  station: Station | undefined;
  subscribersByServiceType: SubscribersByServiceType = {};
  serviceTypes = SERVICE_TYPES;
  isLoading: boolean = false;
  stationName: string = '';
  selectedServiceTypes: ServiceType[] = [...SERVICE_TYPES];
  pingResultData: any = null;
  pingError: string = '';

  @ViewChild('pingResultsModal') pingResultsModal!: TemplateRef<any>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firebaseService: FirebaseService,
    private modalService: NgbModal,
    private pingService: PingService,
  ) {}

  ngOnInit(): void {
    this.stationName = this.route.snapshot.paramMap.get('name') || '';
    if (!this.stationName) {
      this.router.navigate(['/pages/home']);
      return;
    }
    this.loadStationDetails();
  }

  /**
   * Load station details and subscribers
   */
  loadStationDetails(): void {
    this.isLoading = true;

    this.firebaseService.getStationByName(this.stationName).subscribe({
      next: (station: Station | undefined) => {
        this.station = station;
        if (!station) {
          this.router.navigate(['/pages/home']);
          return;
        }
        this.loadSubscribers();
      },
      error: (error: any) => {
        console.error('Error loading station:', error);
        this.isLoading = false;
      },
    });
  }

  /**
   * Load subscribers grouped by service type
   */
  loadSubscribers(): void {
    if (!this.station) return;
    this.firebaseService
      .getSubscribersByServiceType(this.station.name)
      .subscribe({
        next: (subscribers: SubscribersByServiceType) => {
          // Filter out deleted subscribers from each service type
          const filteredSubscribers: SubscribersByServiceType = {};
          for (const [serviceType, subs] of Object.entries(subscribers)) {
            filteredSubscribers[serviceType as ServiceType] = subs.filter(
              (sub: Subscriber) => !sub.isDeleted,
            );
          }
          this.subscribersByServiceType = filteredSubscribers;
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading subscribers:', error);
          this.isLoading = false;
        },
      });
  }

  /**
   * Get subscribers for a specific service type
   */
  getSubscribersForType(serviceType: ServiceType): Subscriber[] {
    return this.subscribersByServiceType[serviceType] || [];
  }

  /**
   * Get all subscribers from all service types
   */
  getAllSubscribers(): Subscriber[] {
    const allSubscribers: Subscriber[] = [];
    for (const serviceType of this.serviceTypes) {
      allSubscribers.push(...this.getSubscribersForType(serviceType));
    }
    return allSubscribers;
  }

  /**
   * Get subscribers filtered by selected service types
   */
  getFilteredSubscribers(): Subscriber[] {
    const filtered: Subscriber[] = [];
    for (const serviceType of this.selectedServiceTypes) {
      filtered.push(...this.getSubscribersForType(serviceType));
    }
    return filtered;
  }

  /**
   * Toggle service type selection
   */
  toggleServiceType(serviceType: ServiceType): void {
    const index = this.selectedServiceTypes.indexOf(serviceType);
    if (index > -1) {
      this.selectedServiceTypes.splice(index, 1);
    } else {
      this.selectedServiceTypes.push(serviceType);
    }
  }

  /**
   * Check if service type is selected
   */
  isServiceTypeSelected(serviceType: ServiceType): boolean {
    return this.selectedServiceTypes.includes(serviceType);
  }

  /**
   * Select all service types
   */
  selectAllServiceTypes(): void {
    this.selectedServiceTypes = [...SERVICE_TYPES];
  }

  /**
   * Clear all service types
   */
  clearServiceTypeSelection(): void {
    this.selectedServiceTypes = [];
  }

  /**
   * Open subscriber modal for adding new subscriber
   */
  openAddSubscriberModal(): void {
    const modalRef = this.modalService.open(SubscriberModalComponent, {
      centered: true,
      size: 'xl',
    });
    modalRef.componentInstance.stationName = this.station?.name || '';
    modalRef.componentInstance.isEditMode = false;

    modalRef.result.then(
      () => {
        this.loadSubscribers();
      },
      () => {},
    );
  }

  /**
   * Open subscriber modal for editing
   */
  openEditSubscriberModal(subscriber: Subscriber): void {
    const modalRef = this.modalService.open(SubscriberModalComponent, {
      centered: true,
      size: 'xl',
    });
    modalRef.componentInstance.stationName = this.station?.name || '';
    modalRef.componentInstance.subscriber = subscriber;
    modalRef.componentInstance.isEditMode = true;

    modalRef.result.then(() => {
      this.loadSubscribers();
    });
  }

  /**
   * Delete subscriber - with confirmation modal
   */
  deleteSubscriber(subscriber: Subscriber): void {
    const modalRef = this.modalService.open(DeleteConfirmationModalComponent, {
      centered: true,
    });
    modalRef.componentInstance.itemName =
      subscriber.subscriberName || 'this subscriber';
    modalRef.componentInstance.itemType = 'Subscriber';

    modalRef.result.then(
      (confirmed) => {
        if (confirmed) {
          const userStr = localStorage.getItem('user');
          const user = userStr ? JSON.parse(userStr) : null;
          const currentUser = this.extractUsernameFromEmail(
            user?.email || 'Admin',
          );

          this.firebaseService
            .deleteSubscriber(subscriber.key, currentUser)
            .then(() => {
              this.loadSubscribers();
            })
            .catch((error: any) => {
              console.error('Error deleting subscriber:', error);
            });
        }
      },
      (dismissed) => {
        // Modal dismissed/cancelled
      },
    );
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
   * Navigate to home page
   */
  goToHome(): void {
    this.router.navigate(['/stations']);
  }

  /**
   * Open management IP in new tab
   */
  openManagementIP(ip: string): void {
    if (ip && ip !== '-') {
      window.open(`http://${ip}`, '_blank');
    }
  }

  /**
   * Ping management IP - execute ping command via PingService
   */
  pingManagementIP(ip: string): void {
    if (!ip || ip === '-') {
      return;
    }

    // Call PingService to execute ping
    this.pingService.ping(ip).subscribe({
      next: (response) => {
        console.log('Ping result:', response);
        this.pingResultData = response;
        this.pingError = '';
        this.openPingResultsModal();
      },
      error: (error) => {
        console.error('Ping error:', error);
        let errorMessage = 'Unknown error occurred';

        if (error.status === 0) {
          errorMessage = 'Network error: Unable to reach the server';
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.pingResultData = null;
        this.pingError = errorMessage;
        this.openPingResultsModal();
      },
    });
  }

  /**
   * Open ping results modal
   */
  private openPingResultsModal(): void {
    this.modalService.open(this.pingResultsModal, {
      centered: true,
      size: 'lg',
    });
  }

  /**
   * Export filtered subscribers to Excel
   */
  exportToCSV(): void {
    const filteredSubscribers = this.getFilteredSubscribers();

    if (filteredSubscribers.length === 0) {
      alert('No subscribers to export');
      return;
    }

    // Prepare Excel data with all fields
    const headers = [
      'Subscriber Name',
      'Line Code',
      'Link MAC Address',
      'Unit Type',
      'Unit Direction',
      'Management IP',
      'Mikrotik ID',
      'Mikrotik MAC Address',
      'SAS Name',
      'SAS Port',
      'ODF Name',
      'ODF Port',
      'Management VLAN',
      'Created By',
      'Created Date',
      'Updated By',
      'Updated Date',
      'Service Type',
    ];

    const rows = filteredSubscribers.map((sub) => [
      sub.subscriberName || '',
      sub.lineCode || '',
      sub.linkMacAddress || '',
      sub.unitType || '',
      sub.unitDirection || '',
      sub.managementIP || '',
      sub.mikrotikID || '',
      sub.mikrotikMacAddress || '',
      sub.sasName || '',
      sub.sasPort || '',
      sub.odfName || '',
      sub.odfPort || '',
      sub.managementVlan || '',
      sub.createdBy || '',
      sub.createdAt || '',
      sub.updatedBy || '',
      sub.updatedAt || '',
      sub.serviceType || '',
    ]);

    // Create Excel using dynamic import
    import('xlsx')
      .then((XLSX: any) => {
        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

        // Set column widths
        const columnWidths = [
          { wch: 20 }, // Subscriber Name
          { wch: 15 }, // Line Code
          { wch: 20 }, // Link MAC Address
          { wch: 15 }, // Unit Type
          { wch: 15 }, // Unit Direction
          { wch: 16 }, // Management IP
          { wch: 15 }, // Mikrotik ID
          { wch: 20 }, // Mikrotik MAC Address
          { wch: 15 }, // SAS Name
          { wch: 12 }, // SAS Port
          { wch: 15 }, // ODF Name
          { wch: 12 }, // ODF Port
          { wch: 16 }, // Management VLAN
          { wch: 15 }, // Created By
          { wch: 18 }, // Created Date
          { wch: 15 }, // Updated By
          { wch: 18 }, // Updated Date
          { wch: 15 }, // Service Type
        ];
        ws['!cols'] = columnWidths;

        // Set row heights - كلها 20
        ws['!rows'] = [
          { hpx: 20 }, // Header row
          ...Array(rows.length).fill({ hpx: 20 }), // Data rows
        ];

        // Freeze header row
        ws['!freeze'] = { xSplit: 0, ySplit: 1 };

        // Apply styles to headers - Row 1
        for (let col = 0; col < headers.length; col++) {
          const cellAddress = XLSX.utils.encode_col(col) + '1';
          if (!ws[cellAddress]) ws[cellAddress] = { v: headers[col], t: 's' };

          ws[cellAddress].s = {
            fill: {
              fgColor: { rgb: '5A9618' },
            },
            font: {
              bold: true,
              color: { rgb: 'FFFFFF' },
              sz: 11,
              name: 'Calibri',
            },
            alignment: {
              horizontal: 'center',
              vertical: 'center',
              wrapText: true,
            },
            border: {
              top: { style: 'medium', color: { rgb: '000000' } },
              bottom: { style: 'medium', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } },
            },
          };
        }

        // Apply styles to data rows (starting from row 2)
        for (let row = 0; row < rows.length; row++) {
          for (let col = 0; col < headers.length; col++) {
            const cellAddress = XLSX.utils.encode_col(col) + (row + 2);
            if (!ws[cellAddress]) ws[cellAddress] = { v: '', t: 's' };

            const backgroundColor = row % 2 === 0 ? 'FFFFFF' : 'F0F8E8';

            ws[cellAddress].s = {
              fill: {
                fgColor: { rgb: backgroundColor },
              },
              font: {
                color: { rgb: '1F2937' },
                sz: 10,
                name: 'Calibri',
              },
              alignment: {
                horizontal: 'center',
                vertical: 'center',
                wrapText: false,
              },
              border: {
                top: { style: 'thin', color: { rgb: 'D1D5DB' } },
                bottom: { style: 'thin', color: { rgb: 'D1D5DB' } },
                left: { style: 'thin', color: { rgb: 'D1D5DB' } },
                right: { style: 'thin', color: { rgb: 'D1D5DB' } },
              },
            };
          }
        }

        // Add sheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Subscribers');

        // Generate file name with timestamp
        const date = new Date();
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const fileName = `${this.stationName}_Subscribers_${dateStr}.xlsx`;

        // Write file with better formatting
        XLSX.writeFile(wb, fileName, {
          bookType: 'xlsx',
          bookSST: false,
          type: 'binary',
        });
      })
      .catch((error) => {
        console.error('Error exporting to Excel:', error);
        alert('Failed to export to Excel. Please try again.');
      });
  }

  goToChangePassword() {
    this.router.navigate(['/auth/change-password']);
  }

  logout(): void {
    localStorage.removeItem('user');
    this.router.navigate(['/auth/login']);
  }
}

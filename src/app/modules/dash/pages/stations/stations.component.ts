import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DeleteConfirmationModalComponent } from '../../components/delete-confirmation-modal/delete-confirmation-modal.component';
import { StationModalComponent } from '../../components/station-modal/station-modal.component';
import { Station } from '../../models/station.model';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-stations',
  templateUrl: './stations.component.html',
  styleUrls: ['./stations.component.css'],
})
export class StationsComponent implements OnInit {
  stations: Station[] = [];
  filteredStations: Station[] = [];
  selectedStation: Station | null = null;
  searchTerm: string = '';
  isLoading: boolean = false;

  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    this.loadStations();
  }

  /**
   * Load all stations from Firestore
   */
  loadStations(): void {
    this.isLoading = true;
    this.firebaseService.getAllStations().subscribe({
      next: (stations: Station[]) => {
        // Filter out deleted stations
        this.stations = stations.filter((station) => !station.isDeleted);
        this.filteredStations = [];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading stations:', error);
        this.isLoading = false;
      },
    });
  }

  /**
   * Search stations by name
   */
  onSearch(term: string): void {
    this.searchTerm = term;
    if (!term.trim()) {
      this.filteredStations = [];
      return;
    }

    this.filteredStations = this.stations.filter((station) =>
      station.name.toLowerCase().includes(term.toLowerCase()),
    );
  }

  /**
   * Navigate to station details page
   */
  goToStationDetails(station: Station): void {
    this.router.navigate(['/station-details', station.name]);
  }

  /**
   * Open Add Station Modal
   */
  openAddStationModal(): void {
    const modalRef = this.modalService.open(StationModalComponent, {
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance.isEditMode = false;
  }

  /**
   * Open Edit Station Modal
   */
  openEditStationModal(station: Station): void {
    const modalRef = this.modalService.open(StationModalComponent, {
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance.station = station;
    modalRef.componentInstance.isEditMode = true;
  }

  /**
   * Delete station (soft delete) - with confirmation modal
   */
  deleteStation(station: Station): void {
    const modalRef = this.modalService.open(DeleteConfirmationModalComponent, {
      centered: true
    });
    modalRef.componentInstance.itemName = station.name || 'this station';
    modalRef.componentInstance.itemType = 'Station';

    modalRef.result.then(
      (confirmed) => {
        if (confirmed) {
          const userStr = localStorage.getItem('user');
          const user = userStr ? JSON.parse(userStr) : null;
          const currentUser = this.extractUsernameFromEmail(
            user?.email || 'Admin',
          );

          this.firebaseService
            .deleteStation(station.key, currentUser)
            .then(() => {
              this.loadStations();
            })
            .catch((error: any) => {
              console.error('Error deleting station:', error);
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
   */
  private extractUsernameFromEmail(email: string): string {
    const username = email.split('@')[0];
    return username.replace(/\d+/g, '');
  }

  goToChangePassword() {
    this.router.navigate(['/auth/change-password']);
  }
  
  logout(): void {
    localStorage.removeItem('user');
    this.router.navigate(['/auth/login']);
  }
}

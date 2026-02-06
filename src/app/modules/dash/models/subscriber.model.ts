import { ServiceType } from './enums';

/**
 * Subscriber Model
 * Represents a subscriber in the Firestore collection
 * Each subscriber belongs to exactly one station and service type
 */
export interface Subscriber {
  // Key fields
  key: string; // Unique identifier (random 24+ char string)
  stationName: string; // Station name (relationship)
  serviceType: ServiceType; // Service type (ENUM: MOBADARA, PTP, BS)

  // Subscriber fields (13 specific required fields)
  subscriberName: string; // Subscriber name
  lineCode: string; // Line code
  unitType: string; // Unit type
  linkMacAddress: string; // MAC address link
  unitDirection: string; // Unit direction
  managementIP: string; // Management IP
  mikrotikID: string; // Mikrotik ID
  mikrotikMacAddress: string; // Mikrotik MAC address
  sasName: string; // SAS name
  sasPort: string; // SAS port
  odfName: string; // ODF name
  odfPort: string; // ODF port
  managementVlan: string; // Management VLAN
  notes?: string; // Additional notes

  // Audit fields (track who created, updated, and deleted)
  createdAt: number; // Creation timestamp (milliseconds)
  createdBy: string; // User who created the subscriber
  updatedAt?: number; // Last update timestamp (milliseconds)
  updatedBy?: string; // User who last updated the subscriber
  deletedBy?: string; // User who deleted the subscriber (soft delete)
  isDeleted?: boolean; // Soft delete flag (if true, don't display in UI)
}

/**
 * Subscriber creation request model
 */
export interface CreateSubscriberRequest {
  stationName: string;
  serviceType: ServiceType;
  subscriberName: string;
  lineCode: string;
  unitType: string;
  linkMacAddress: string;
  unitDirection: string;
  managementIP: string;
  mikrotikID: string;
  mikrotikMacAddress: string;
  sasName: string;
  sasPort: string;
  odfName: string;
  odfPort: string;
  managementVlan: string;
  notes?: string;
  createdBy: string; // User creating the subscriber
}

/**
 * Subscriber update request model
 */
export interface UpdateSubscriberRequest {
  serviceType?: ServiceType;
  subscriberName?: string;
  lineCode?: string;
  unitType?: string;
  linkMacAddress?: string;
  unitDirection?: string;
  managementIP?: string;
  mikrotikID?: string;
  mikrotikMacAddress?: string;
  sasName?: string;
  sasPort?: string;
  odfName?: string;
  odfPort?: string;
  managementVlan?: string;
  notes?: string;
  updatedBy?: string; // User updating the subscriber
}

/**
 * Subscriber list grouped by service type
 * Used for displaying subscribers on station details page
 */
export interface SubscribersByServiceType {
  [ServiceType.MOBADARA]?: Subscriber[];
  [ServiceType.PTP]?: Subscriber[];
  [ServiceType.BASE_STATION]?: Subscriber[];
}

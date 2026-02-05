/**
 * Station Model
 * Represents a station in the Firestore collection
 */
export interface Station {
  key: string; // Unique identifier (random 24+ char string)
  name: string; // Station name (required)

  // Audit fields
  createdAt: number; // Creation timestamp (milliseconds)
  createdBy: string; // User who created the station
  updatedAt?: number; // Last update timestamp (milliseconds)
  updatedBy?: string; // User who last updated the station
  deletedBy?: string; // User who deleted the station (soft delete)
  isDeleted?: boolean; // Soft delete flag (if true, don't display in UI)
}

/**
 * Station creation request model
 * Used when creating a new station (key and timestamps auto-generated)
 */
export interface CreateStationRequest {
  name: string;
  createdBy: string; // User creating the station
}

/**
 * Station update request model
 * Used when updating an existing station
 */
export interface UpdateStationRequest {
  name?: string;
  updatedBy?: string; // User updating the station
}

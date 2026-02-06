import { Injectable } from '@angular/core';
import {
  AngularFireDatabase,
  AngularFireList,
} from '@angular/fire/compat/database';
import { Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { SERVICE_TYPES, ServiceType } from '../models/enums';
import {
  CreateStationRequest,
  Station,
  UpdateStationRequest,
} from '../models/station.model';
import {
  CreateSubscriberRequest,
  Subscriber,
  SubscribersByServiceType,
  UpdateSubscriberRequest,
} from '../models/subscriber.model';

/**
 * FirebaseService
 *
 * CRITICAL: NO Device entity exists in this system.
 * Only Station and Subscriber collections are used.
 *
 * All device-related data is stored directly in Subscriber objects.
 */
@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private stationsList: AngularFireList<Station>;
  private subscribersList: AngularFireList<Subscriber>;

  constructor(private db: AngularFireDatabase) {
    this.stationsList = this.db.list<Station>('stations');
    this.subscribersList = this.db.list<Subscriber>('subscribers');
  }

  // ============================================================================
  // STATION OPERATIONS
  // ============================================================================

  getAllStations(): Observable<Station[]> {
    return this.stationsList.snapshotChanges().pipe(
      map((actions) =>
        actions.map(
          (a) =>
            ({
              ...a.payload.val(),
              key: a.key,
            }) as Station,
        ),
      ),
    );
  }

  getStationByName(stationName: string): Observable<Station | undefined> {
    return this.getAllStations().pipe(
      map((stations) => stations.find((s) => s.name === stationName)),
    );
  }

  searchStationsByName(searchTerm: string): Observable<Station[]> {
    return this.getAllStations().pipe(
      map((stations) =>
        stations.filter((station) =>
          station.name.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      ),
    );
  }

  createStation(request: CreateStationRequest): Promise<string> {
    const now = Date.now(); // Get timestamp in milliseconds
    const key = this.generateKey(); // Generate random key
    const station: Station = {
      key,
      ...request,
      createdAt: now,
    };
    return this.stationsList.set(key, station as any).then(() => key);
  }

  updateStation(
    stationKey: string,
    request: UpdateStationRequest,
  ): Promise<void> {
    return this.stationsList.update(stationKey, {
      ...request,
      updatedAt: Date.now(),
    } as any);
  }

  deleteStation(stationKey: string, deletedBy: string): Promise<void> {
    // Soft delete - mark as deleted and store who deleted it
    return this.stationsList.update(stationKey, {
      isDeleted: true,
      deletedBy: deletedBy,
      updatedAt: Date.now(),
    } as any);
  }

  // ============================================================================
  // SUBSCRIBER OPERATIONS
  // ============================================================================

  getSubscribersByStationName(stationName: string): Observable<Subscriber[]> {
    return this.subscribersList.snapshotChanges().pipe(
      map((actions) =>
        actions
          .map(
            (a) =>
              ({
                ...a.payload.val(),
                key: a.key,
              }) as Subscriber,
          )
          .filter((sub) => sub.stationName === stationName),
      ),
    );
  }

  getSubscribersByServiceType(
    stationName: string,
  ): Observable<SubscribersByServiceType> {
    return this.getSubscribersByStationName(stationName).pipe(
      map((subscribers) => {
        const grouped: SubscribersByServiceType = {};
        SERVICE_TYPES.forEach((serviceType) => {
          const filtered = subscribers.filter(
            (sub) => sub.serviceType === serviceType,
          );
          grouped[serviceType as ServiceType] = filtered;
        });

        return grouped;
      }),
    );
  }

  getSubscribersByType(
    stationName: string,
    serviceType: ServiceType,
  ): Observable<Subscriber[]> {
    return this.subscribersList.snapshotChanges().pipe(
      map((actions) =>
        actions
          .map(
            (a) =>
              ({
                ...a.payload.val(),
                key: a.key,
              }) as Subscriber,
          )
          .filter(
            (sub) =>
              sub.stationName === stationName &&
              sub.serviceType === serviceType,
          ),
      ),
    );
  }

  getSubscriberByKey(
    subscriberKey: string,
  ): Observable<Subscriber | undefined> {
    return this.subscribersList.snapshotChanges().pipe(
      map((actions) => {
        const found = actions.find((a) => a.key === subscriberKey);
        if (found) {
          return {
            ...found.payload.val(),
            key: found.key,
          } as Subscriber;
        }
        return undefined;
      }),
    );
  }

  createSubscriber(request: CreateSubscriberRequest): Promise<string> {
    const now = Date.now(); // Get timestamp in milliseconds
    const key = this.generateKey(); // Generate random key
    const subscriber: Subscriber = {
      key,
      ...request,
      createdAt: now,
    };
    return this.subscribersList.set(key, subscriber as any).then(() => key);
  }

  updateSubscriber(
    subscriberKey: string,
    request: UpdateSubscriberRequest,
  ): Promise<void> {
    return this.subscribersList.update(subscriberKey, {
      ...request,
      updatedAt: Date.now(),
    } as any);
  }

  deleteSubscriber(subscriberKey: string, deletedBy: string): Promise<void> {
    // Soft delete - mark as deleted and store who deleted it
    return this.subscribersList.update(subscriberKey, {
      isDeleted: true,
      deletedBy: deletedBy,
      updatedAt: Date.now(),
    } as any);
  }

  async bulkImportSubscribers(
    subscribers: CreateSubscriberRequest[],
  ): Promise<string[]> {
    const importedIds: string[] = [];
    for (const subscriber of subscribers) {
      const id = await this.createSubscriber(subscriber);
      importedIds.push(id);
    }
    return importedIds;
  }

  async deleteSubscribersByStationName(
    stationName: string,
    deletedBy: string = 'System',
  ): Promise<void> {
    const subscribers = await firstValueFrom(
      this.getSubscribersByStationName(stationName),
    );
    for (const subscriber of subscribers) {
      await this.deleteSubscriber(subscriber.key, deletedBy);
    }
  }

  // ============================================================================
  // BULK DATA OPERATIONS
  // ============================================================================

  /**
   * Get complete station data including all subscribers grouped by service type
   * This is the main endpoint for loading station details
   */
  getCompleteStationData(stationName: string) {
    return {
      station$: this.getStationByName(stationName),
      subscribers$: this.getSubscribersByServiceType(stationName),
    };
  }

  /**
   * Bulk import data from JSON (e.g., from Excel conversion)
   * Expected format: { stations: [], subscribers: [] }
   */
  async bulkImportFromJSON(data: {
    stations: CreateStationRequest[];
    subscribers: CreateSubscriberRequest[];
  }): Promise<{ stationIds: string[]; subscriberIds: string[] }> {
    const stationIds: string[] = [];
    const subscriberIds: string[] = [];

    // Import stations first
    for (const station of data.stations) {
      const id = await this.createStation(station);
      stationIds.push(id);
    }

    // Then import subscribers
    for (const subscriber of data.subscribers) {
      const id = await this.createSubscriber(subscriber);
      subscriberIds.push(id);
    }

    return { stationIds, subscriberIds };
  }

  /**
   * Import data directly from Firebase JSON format
   * This handles the object-of-objects format exported from Firebase
   * Format: { stations: { key1: {...}, key2: {...} }, subscribers: { key1: {...}, key2: {...} } }
   */
  async importFromFirebaseJSON(data: {
    stations: { [key: string]: Station };
    subscribers: { [key: string]: Subscriber };
  }): Promise<{ importedStations: number; importedSubscribers: number }> {
    let importedStations = 0;
    let importedSubscribers = 0;

    // Import stations with their existing keys
    if (data.stations) {
      for (const [key, station] of Object.entries(data.stations)) {
        try {
          await this.stationsList.set(key, station as any);
          importedStations++;
        } catch (error) {
          console.error(`Error importing station ${key}:`, error);
        }
      }
    }

    // Import subscribers with their existing keys
    if (data.subscribers) {
      for (const [key, subscriber] of Object.entries(data.subscribers)) {
        try {
          await this.subscribersList.set(key, subscriber as any);
          importedSubscribers++;
        } catch (error) {
          console.error(`Error importing subscriber ${key}:`, error);
        }
      }
    }

    return { importedStations, importedSubscribers };
  }

  /**
   * Export all data to JSON format
   * Perfect for backups or Excel re-export
   */
  async exportToJSON(): Promise<{
    stations: Station[];
    subscribers: Subscriber[];
  }> {
    const stations = await firstValueFrom(this.getAllStations());
    const subscribers = await firstValueFrom(
      this.subscribersList.snapshotChanges().pipe(
        map((actions) =>
          actions.map(
            (a) =>
              ({
                ...a.payload.val(),
                key: a.key,
              }) as Subscriber,
          ),
        ),
      ),
    );

    return { stations, subscribers };
  }

  /**
   * Generate a completely random unique key
   * Format: random alphanumeric string (12 characters)
   */
  private generateKey(): string {
    return (
      Math.random().toString(36).substring(2, 14) +
      Math.random().toString(36).substring(2, 14)
    );
  }
}

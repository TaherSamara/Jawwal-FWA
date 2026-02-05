/**
 * Service Type Enum
 * Only three service types are allowed across the system
 */
export enum ServiceType {
  MOBADARA = 'Mobadara',
  PTP = 'PTP',
  BASE_STATION = 'Base Station',
}

/**
 * Helper function to get all service types
 */
export const SERVICE_TYPES = [
  ServiceType.MOBADARA,
  ServiceType.PTP,
  ServiceType.BASE_STATION,
];

/**
 * Helper function to validate if a value is a valid service type
 */
export function isValidServiceType(value: string): boolean {
  return SERVICE_TYPES.includes(value as ServiceType);
}

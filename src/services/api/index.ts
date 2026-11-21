import { IEcommerceApiClient } from '@/types/ecommerce';
import { HttpEcommerceApiClient } from './httpApiClient';
import { MockEcommerceApiClient } from './mockApiClient';

// Read config to choose adapter. Defaults to mock mode unless explicitly set to 'false'.
const envMockValue = import.meta.env.VITE_USE_MOCK_API;
export const isUsingMockApi =
  envMockValue === undefined || envMockValue.trim().toLowerCase() !== 'false';

export const ecommerceApi: IEcommerceApiClient = isUsingMockApi
  ? new MockEcommerceApiClient()
  : new HttpEcommerceApiClient();


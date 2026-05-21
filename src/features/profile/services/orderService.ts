import { api } from '@/api/axios';

const BASE = '/v1/order';

type UpdateParams = {
  identifier: string | number; // primary identifier (orderNumber like ORD-... or numeric id)
  fallbackId?: number | string; // optional fallback numeric id or alternate identifier
  orderStatus: string;
};

/**
 * Update order preparing status with a defensive retry.
 * Try `identifier` first; if the server returns 404 and a `fallbackId` is provided,
 * retry the same request using the fallbackId.
 */
export const updateOrderPreparingStatus = async ({ identifier, fallbackId, orderStatus }: UpdateParams) => {
  const attempt = async (id: string | number) => {
    const url = `${BASE}/preparing/${id}`;
    const response = await api.put(url, null, { params: { orderStatus } });
    return response.data;
  };

  try {
    return await attempt(identifier);
  } catch (err: any) {
    // If backend returned 404 (not found) and we have a fallback, try it once.
    const status = err?.response?.status;
    if ((status === 404 || status === '404') && fallbackId !== undefined) {
      try {
        return await attempt(fallbackId);
      } catch (secondErr: any) {
        // rethrow the second error so caller sees the final failure
        throw secondErr;
      }
    }
    // rethrow original error
    throw err;
  }
};

export default {
  updateOrderPreparingStatus,
};

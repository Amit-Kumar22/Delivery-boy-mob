import { api } from "@/api/axios";
import type {
  DeliveryBoyProfile,
  VehicleDetailRequest,
  DocumentRequest,
  DeliveryStatus,
  AvailabilityStatus,
} from "../types";

const BASE_PATH = "/v1/delivery-user";

/**
 * Add or update vehicle details for the delivery boy
 */
export const addUpdateVehicleDetail = async (
  data: VehicleDetailRequest
): Promise<{ message: string; data: any }> => {
  const response = await api.post(`${BASE_PATH}/add-update-vehicle-detail`, data);
  return response.data;
};

/**
 * Add or update document for the delivery boy
 */
export const addUpdateDocument = async (
  data: DocumentRequest
): Promise<{ message: string; data: any }> => {
  // Prepare multipart/form-data for file upload
  const formData = new FormData();
  formData.append("type", data.type);

  const appendFile = (fieldName: string, uri: string) => {
    if (!uri) return;
    // Extract filename
    const uriParts = uri.split("/");
    const name = uriParts[uriParts.length - 1] || `${fieldName}.jpg`;
    // Determine mime type from extension
    const extMatch = name.match(/\.([^.]+)$/);
    const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";
    const type = ext === "png" ? "image/png" : "image/jpeg";

    // In React Native FormData, file should be an object with uri, name and type
    // Cast to any to satisfy TypeScript
    formData.append(fieldName, { uri, name, type } as any);
  };

  appendFile("frontImage", data.frontImage);
  appendFile("backImage", data.backImage);

  const response = await api.post(`${BASE_PATH}/add-update-document`, formData, {
    headers: {
      // Let axios / RN set the correct boundary; specifying multipart/form-data is OK here
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * Update delivery boy status
 */
export const updateDeliveryStatus = async (
  userId: number,
  status: DeliveryStatus
): Promise<{ message: string; data: any }> => {
  const response = await api.put(`${BASE_PATH}/update-status/${userId}`, { status });
  return response.data;
};

/**
 * Get logged in delivery boy profile
 */
export const getLoggedInProfile = async (): Promise<DeliveryBoyProfile> => {
  try {
    // Try delivery-specific endpoint first
    const response = await api.get(`${BASE_PATH}/loggedIn`);
    return response.data;
  } catch (error: any) {
    // If delivery endpoint fails (404, 500, etc.), try the general profile endpoint
    if (error.response?.status === 404 || error.response?.status === 500) {
      console.log('Delivery endpoint failed, trying general profile endpoint');
      try {
        const fallbackResponse = await api.get('/v1/api/profile');
        const profileData = fallbackResponse.data.result || fallbackResponse.data;
        
        // Transform general profile to delivery boy profile format
        const now = new Date().toISOString();
        return {
          id: profileData.id,
          name: profileData.fullName || profileData.name,
          email: profileData.email,
          phone: profileData.phone || '',
          profileImage: profileData.profileImage || null,
          status: (profileData.status || 'ACTIVE') as DeliveryStatus,
          active: profileData.status === 'ACTIVE' || true,
          verified: profileData.otpVerified || false,
          availability: 'ONLINE' as AvailabilityStatus,
          rating: 0,
          totalDeliveries: 0,
          created: profileData.created || now,
          updated: profileData.updated || now,
          vehicle: null,
          deliveryBoyDocuments: null,
          serviceAreaMappings: null,
        } as DeliveryBoyProfile;
      } catch (fallbackError) {
        console.error('Both profile endpoints failed', fallbackError);
        throw fallbackError;
      }
    }
    throw error;
  }
};

/**
 * Get all service areas (paginated)
 */
export const getAllServiceAreas = async (
  page = 0,
  size = 10,
  sort?: string[],
): Promise<any> => {
  // New API expects a pageable object. The endpoint is a GET but accepts
  // the pageable object as a query parameter named `pageable` (stringified JSON).
  const pageable: any = { page, size };
  if (sort) pageable.sort = sort;

  const params: any = { pageable: JSON.stringify(pageable) };

  const response = await api.get(`${BASE_PATH}/all-service-area`, { params });

  // The backend returns a paginated response. Return it as-is but ensure
  // common fields exist to avoid callers breaking when some fields are missing.
  const data = response.data || {};
  return {
    content: data.content || [],
    totalElements: data.totalElements ?? 0,
    totalPages: data.totalPages ?? 0,
    pageNumber: data.pageNumber ?? (pageable.page ?? 0),
    pageSize: data.pageSize ?? (pageable.size ?? 0),
    last: data.last ?? true,
    // include raw payload for debugging if needed
    _raw: data,
  };
};

/**
 * Get all products/orders (paginated) - supports franchiseId and date filter
 */
export const getAllProducts = async (
  page = 0,
  size = 10,
  sort?: string[],
  franchiseId?: number,
  date?: string,
): Promise<any> => {
  // Make franchiseId optional. If provided, include it in params; otherwise
  // call the endpoint without franchiseId so backend returns all orders.
  const params: any = { page, size };
  if (franchiseId !== undefined && franchiseId !== null) params.franchiseId = franchiseId;
  if (sort) params.sort = sort;
  if (date) params.date = date;

  console.log('📦 getAllProducts params:', { page, size, sort, franchiseId, date, finalParams: params });

  try {
    const response = await api.get(`${BASE_PATH}/all-product`, { params });
    console.log('📦 getAllProducts response:', { 
      totalElements: response.data?.totalElements, 
      contentLength: response.data?.content?.length,
      params 
    });
    return response.data;
  } catch (err: any) {
    // Some backend deployments still require franchiseId and return a 500 with
    // a message mentioning franchiseId. If caller did not pass franchiseId,
    // return an empty paginated response instead of bubbling a server 500 to the UI.
    const serverMsg = err?.response?.data?.message ?? '';
    if ((franchiseId === undefined || franchiseId === null) && typeof serverMsg === 'string' && serverMsg.toLowerCase().includes('franchiseid')) {
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        pageNumber: page,
        pageSize: size,
        last: true,
        _error: err?.response?.data,
      };
    }
    throw err;
  }
};

/**
 * Get all delivery users (paginated) - accepts a pageable object and optional franchiseId
 * The backend expects the pageable as a query param named `pageable` (stringified JSON).
 * If the backend responds with an error complaining about missing franchiseId, and
 * the caller did not provide franchiseId, this function will return an empty page
 * instead of bubbling up a 500 — this keeps the UI stable while the backend contract
 * is clarified.
 */
export const getAllDeliveryUsers = async (
  page = 0,
  size = 10,
  sort?: string[],
  franchiseId?: number,
): Promise<any> => {
  const pageable: any = { page, size };
  if (sort) pageable.sort = sort;

  const params: any = { pageable: JSON.stringify(pageable) };
  if (franchiseId !== undefined && franchiseId !== null) params.franchiseId = franchiseId;

  try {
    const response = await api.get(`${BASE_PATH}/all`, { params });
    const data = response.data || {};
    return {
      content: data.content || [],
      totalElements: data.totalElements ?? 0,
      totalPages: data.totalPages ?? 0,
      pageNumber: data.pageNumber ?? (pageable.page ?? 0),
      pageSize: data.pageSize ?? (pageable.size ?? 0),
      last: data.last ?? true,
      _raw: data,
    };
  } catch (err: any) {
    // If server requires franchiseId and caller didn't pass it, return an empty page
    const serverMsg = err?.response?.data?.message ?? '';
    if ((franchiseId === undefined || franchiseId === null) && typeof serverMsg === 'string' && serverMsg.toLowerCase().includes('franchiseid')) {
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        pageNumber: page,
        pageSize: size,
        last: true,
        _error: err?.response?.data,
      };
    }
    throw err;
  }
};

/**
 * Get all franchises
 */
export const getAllFranchises = async (
  page = 0,
  size = 100,
): Promise<any> => {
  const pageable: any = { page, size };
  const params: any = { pageable: JSON.stringify(pageable) };

  const response = await api.get(`/v1/admin/all-franchises`, { params });
  const data = response.data || {};
  return {
    content: data.content || [],
    totalElements: data.totalElements ?? 0,
    totalPages: data.totalPages ?? 0,
    pageNumber: data.pageNumber ?? page,
    pageSize: data.pageSize ?? size,
    last: data.last ?? true,
  };
};

/**
 * Update order status
 */
export const updateOrderStatus = async (
  orderNumber: string,
  orderStatus: 'DELIVERED' | 'CANCELLED' | 'RETURNED'
): Promise<{ message: string; data: any }> => {
  const response = await api.put(`/v1/order/preparing/${orderNumber}`, null, {
    params: { orderStatus }
  });
  return response.data;
};


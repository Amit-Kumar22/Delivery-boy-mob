import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as profileService from "../services/profileService";
import type { VehicleDetailRequest, DocumentRequest, DeliveryStatus } from "../types";

const PROFILE_QUERY_KEY = ["deliveryBoyProfile"];

/**
 * Hook to fetch logged in delivery boy profile
 */
export const useDeliveryBoyProfile = () => {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: profileService.getLoggedInProfile,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to add/update vehicle details
 */
export const useAddUpdateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VehicleDetailRequest) =>
      profileService.addUpdateVehicleDetail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
};

/**
 * Hook to fetch paginated service areas
 */
export const useAllServiceAreas = (page = 0, size = 10, sort?: string[]) => {
  return useQuery({
    queryKey: ["serviceAreas", page, size, sort],
    queryFn: () => profileService.getAllServiceAreas(page, size, sort),
  });
};

/**
 * Hook to fetch paginated products/orders
 */
export const useAllProducts = (
  page = 0,
  size = 10,
  sort?: string[],
  franchiseId?: number,
  date?: string,
) => {
  return useQuery({
    queryKey: ["products", page, size, sort, franchiseId, date],
    // If franchiseId is not provided, don't run the query automatically.
    // The service requires franchiseId and will throw if missing.
    queryFn: () => profileService.getAllProducts(page, size, sort, franchiseId, date),
    // Enabled by default so the UI shows all orders when no franchiseId filter
    enabled: true,
  });
};

/**
 * Hook to fetch paginated delivery users
 */
export const useAllDeliveryUsers = (
  page = 0,
  size = 10,
  sort?: string[],
  franchiseId?: number,
) => {
  return useQuery({
    queryKey: ["deliveryUsers", page, size, sort, franchiseId],
    queryFn: () => profileService.getAllDeliveryUsers(page, size, sort, franchiseId),
    // allow callers to opt-in by passing franchiseId, otherwise the service
    // will return an empty page when the backend rejects missing franchiseId
    enabled: true,
  });
};

/**
 * Hook to add/update documents
 */
export const useAddUpdateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DocumentRequest) =>
      profileService.addUpdateDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
};

/**
 * Hook to update delivery status
 */
export const useUpdateDeliveryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      status,
    }: {
      userId: number;
      status: DeliveryStatus;
    }) => profileService.updateDeliveryStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });
};

/**
 * Hook to fetch all franchises
 */
export const useAllFranchises = (page = 0, size = 100) => {
  return useQuery({
    queryKey: ["franchises", page, size],
    queryFn: () => profileService.getAllFranchises(page, size),
    staleTime: 1000 * 60 * 10, // 10 minutes - franchises don't change often
  });
};

/**
 * Hook to update order status
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderNumber,
      orderStatus,
    }: {
      orderNumber: string;
      orderStatus: 'DELIVERED' | 'CANCELLED' | 'RETURNED';
    }) => profileService.updateOrderStatus(orderNumber, orderStatus),
    onSuccess: () => {
      // Invalidate products query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};


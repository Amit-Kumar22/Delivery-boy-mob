import { useMutation, useQueryClient } from '@tanstack/react-query';
import orderService from '../services/orderService';

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderNumber, fallbackId, orderStatus }: { orderNumber: string | number; fallbackId?: string | number; orderStatus: string }) =>
      orderService.updateOrderPreparingStatus({ identifier: orderNumber, fallbackId, orderStatus }),
    onSuccess: (_data, variables) => {
      // Invalidate orders/product lists so UI refreshes
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['deliveryUsers'] });
      // Also optionally invalidate specific order detail queries if present
      qc.invalidateQueries({ queryKey: ['order', variables.orderNumber] });
    },
  });
};

export default useUpdateOrderStatus;

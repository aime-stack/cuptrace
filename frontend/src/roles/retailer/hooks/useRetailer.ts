import { useBatches } from '@/hooks/useBatches';
import { useCurrentUser } from '@/hooks/useAuth';
import { ProductType } from '@/types';

/**
 * Retailer-specific hooks
 */
export const useRetailerBatches = () => {
    const { data: user } = useCurrentUser();
    return useBatches({ retailerId: user?.id }, ProductType.coffee);
};


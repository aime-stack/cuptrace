import { useBatches } from '@/hooks/useBatches';
import { useCurrentUser } from '@/hooks/useAuth';
import { ProductType } from '@/types';

/**
 * Factory-specific hooks
 */
export const useFactoryBatches = () => {
    const { data: user } = useCurrentUser();
    return useBatches({ factoryId: user?.id }, ProductType.coffee);
};


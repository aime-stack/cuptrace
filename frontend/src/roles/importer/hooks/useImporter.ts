import { useBatches } from '@/hooks/useBatches';
import { useCurrentUser } from '@/hooks/useAuth';
import { ProductType } from '@/types';

/**
 * Importer-specific hooks
 */
export const useImporterBatches = () => {
    const { data: user } = useCurrentUser();
    return useBatches({ importerId: user?.id }, ProductType.coffee);
};


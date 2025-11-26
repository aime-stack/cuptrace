import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { Tea } from '@/utils/mockData';

interface TeaForm {
  name: string;
  farmer: string;
  cooperative: string;
  location: string;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected';
}

interface TeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tea: Omit<Tea, 'id'>) => void;
  tea: Tea | null;
}

export default function TeaModal({ isOpen, onClose, onSave, tea }: TeaModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TeaForm>();

  useEffect(() => {
    if (tea) {
      reset({
        name: tea.name,
        farmer: tea.farmer,
        cooperative: tea.cooperative,
        location: tea.location,
        quantity: tea.quantity,
        status: tea.status,
      });
    } else {
      reset({
        name: '',
        farmer: '',
        cooperative: '',
        location: '',
        quantity: 0,
        status: 'pending',
      });
    }
  }, [tea, reset]);

  const onSubmit = (data: TeaForm) => {
    onSave(data);
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {tea ? 'Edit Tea' : 'Add New Tea'}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Farmer</label>
              <input
                type="text"
                {...register('farmer', { required: 'Farmer is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.farmer && <p className="text-red-500 text-xs mt-1">{errors.farmer.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Cooperative</label>
              <input
                type="text"
                {...register('cooperative', { required: 'Cooperative is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.cooperative && <p className="text-red-500 text-xs mt-1">{errors.cooperative.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                {...register('location', { required: 'Location is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity (kg)</label>
              <input
                type="number"
                {...register('quantity', { required: 'Quantity is required', min: { value: 1, message: 'Quantity must be at least 1' } })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                {...register('status')}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {tea ? 'Update' : 'Add'} Tea
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
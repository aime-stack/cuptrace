import { useState, useMemo } from 'react';
import { mockTeas, Tea } from '@/utils/mockData';
import TeaModal from '@/components/farmer/TeaModal';

export default function TeaPage() {
  const [teas, setTeas] = useState<Tea[]>(mockTeas);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTea, setEditingTea] = useState<Tea | null>(null);

  const filteredTeas = useMemo(() => {
    return teas.filter(tea => {
      const matchesSearch = tea.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tea.farmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tea.cooperative.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tea.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || tea.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [teas, searchTerm, statusFilter]);

  const handleAddTea = () => {
    setEditingTea(null);
    setIsModalOpen(true);
  };

  const handleEditTea = (tea: Tea) => {
    setEditingTea(tea);
    setIsModalOpen(true);
  };

  const handleSaveTea = (teaData: Omit<Tea, 'id'>) => {
    if (editingTea) {
      setTeas(teas.map(tea => tea.id === editingTea.id ? { ...teaData, id: editingTea.id } : tea));
    } else {
      const newTea: Tea = { ...teaData, id: Date.now().toString() };
      setTeas([...teas, newTea]);
    }
    setIsModalOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tea Management</h1>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search teas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button
          onClick={handleAddTea}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Add Tea
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cooperative</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTeas.map((tea) => (
              <tr key={tea.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tea.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tea.farmer}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tea.cooperative}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tea.location}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tea.quantity} kg</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(tea.status)}`}>
                    {tea.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEditTea(tea)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTeas.length === 0 && (
        <p className="text-center text-gray-500 mt-8">No teas found matching your criteria.</p>
      )}

      <TeaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTea}
        tea={editingTea}
      />
    </div>
  );
}
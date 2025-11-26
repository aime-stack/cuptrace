export interface Tea {
  id: string;
  name: string;
  farmer: string;
  cooperative: string;
  location: string;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected';
}

export const mockTeas: Tea[] = [
  {
    id: '1',
    name: 'Black Tea Premium',
    farmer: 'John Doe',
    cooperative: 'Kigali Tea Coop',
    location: 'Kigali, Rwanda',
    quantity: 100,
    status: 'approved',
  },
  {
    id: '2',
    name: 'Green Tea Organic',
    farmer: 'Jane Smith',
    cooperative: 'Musanze Tea Coop',
    location: 'Musanze, Rwanda',
    quantity: 50,
    status: 'pending',
  },
  {
    id: '3',
    name: 'White Tea Blend',
    farmer: 'Bob Johnson',
    cooperative: 'Huye Tea Coop',
    location: 'Huye, Rwanda',
    quantity: 75,
    status: 'rejected',
  },
  // Add more mock data as needed
];
import React, { useState } from 'react';
import { CarpoolGroup, User, Child } from '../types';
import { Plus, Users } from 'lucide-react';

interface CreateGroupProps {
  onCreateGroup: (group: CarpoolGroup) => void;
  currentUser: User;
}

const CreateGroup: React.FC<CreateGroupProps> = ({ onCreateGroup, currentUser }) => {
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [maxMembers, setMaxMembers] = useState(4);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [selectedCar, setSelectedCar] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newGroup: CarpoolGroup = {
      id: Date.now().toString(),
      name,
      destination,
      departureTime,
      members: [currentUser.name, ...selectedChildren],
      maxMembers,
      ownerId: currentUser.id,
      joinRequests: [],
    };
    onCreateGroup(newGroup);
    // Reset form
    setName('');
    setDestination('');
    setDepartureTime('');
    setMaxMembers(4);
    setSelectedChildren([]);
    setSelectedCar('');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create a Carpool Group</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group Name"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Destination"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="datetime-local"
          value={departureTime}
          onChange={(e) => setDepartureTime(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          value={maxMembers}
          onChange={(e) => setMaxMembers(parseInt(e.target.value))}
          min="2"
          max="10"
          className="w-full p-2 border rounded"
          required
        />
        <div>
          <label className="block mb-2">Select Children:</label>
          {currentUser.children.map((child) => (
            <label key={child.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={child.id}
                checked={selectedChildren.includes(child.name)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedChildren([...selectedChildren, child.name]);
                  } else {
                    setSelectedChildren(selectedChildren.filter((id) => id !== child.name));
                  }
                }}
              />
              <span>{child.name}</span>
            </label>
          ))}
        </div>
        <div>
          <label className="block mb-2">Select Car:</label>
          <select
            value={selectedCar}
            onChange={(e) => setSelectedCar(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a car</option>
            {currentUser.cars.map((car) => (
              <option key={car.id} value={car.id}>
                {car.model} ({car.seats} seats)
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center justify-center"
        >
          <Plus className="mr-2" size={20} />
          Create Group
        </button>
      </form>
    </div>
  );
};

export default CreateGroup;
import React, { useState } from 'react';
import { CarpoolGroup, User } from '../types';
import { Search, UserPlus } from 'lucide-react';

interface SearchGroupsProps {
  groups: CarpoolGroup[];
  onSendJoinRequest: (groupId: string, userId: string) => void;
  currentUser: User;
}

const SearchGroups: React.FC<SearchGroupsProps> = ({ groups, onSendJoinRequest, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Search Carpool Groups</h2>
      <div className="flex items-center mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or destination"
          className="w-full p-2 border rounded-l"
        />
        <button className="bg-blue-500 text-white p-2 rounded-r">
          <Search size={20} />
        </button>
      </div>
      <ul className="space-y-4">
        {filteredGroups.map((group) => (
          <li key={group.id} className="border p-4 rounded">
            <h3 className="font-bold">{group.name}</h3>
            <p>Destination: {group.destination}</p>
            <p>Departure: {new Date(group.departureTime).toLocaleString()}</p>
            <p>
              Members: {group.members.length} / {group.maxMembers}
            </p>
            {group.ownerId !== currentUser.id && !group.members.includes(currentUser.name) && !group.joinRequests.includes(currentUser.id) && (
              <button
                onClick={() => onSendJoinRequest(group.id, currentUser.id)}
                className="mt-2 bg-green-500 text-white p-2 rounded hover:bg-green-600 flex items-center"
                disabled={group.members.length >= group.maxMembers}
              >
                <UserPlus className="mr-2" size={20} />
                {group.members.length >= group.maxMembers ? 'Full' : 'Send Join Request'}
              </button>
            )}
            {group.joinRequests.includes(currentUser.id) && (
              <p className="mt-2 text-yellow-600">Join request sent</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchGroups;
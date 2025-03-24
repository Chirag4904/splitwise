import React from 'react';
import { CarpoolGroup, User } from '../types';
import { Check, X } from 'lucide-react';

interface ManageRequestsProps {
  groups: CarpoolGroup[];
  onAcceptRequest: (groupId: string, userId: string) => void;
  onDenyRequest: (groupId: string, userId: string) => void;
  currentUser: User;
}

const ManageRequests: React.FC<ManageRequestsProps> = ({
  groups,
  onAcceptRequest,
  onDenyRequest,
  currentUser,
}) => {
  const userGroups = groups.filter((group) => group.ownerId === currentUser.id);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Manage Join Requests</h2>
      {userGroups.map((group) => (
        <div key={group.id} className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{group.name}</h3>
          {group.joinRequests.length === 0 ? (
            <p>No pending requests</p>
          ) : (
            <ul className="space-y-2">
              {group.joinRequests.map((userId) => (
                <li key={userId} className="flex items-center justify-between">
                  <span>{userId}</span>
                  <div>
                    <button
                      onClick={() => onAcceptRequest(group.id, userId)}
                      className="bg-green-500 text-white p-2 rounded mr-2 hover:bg-green-600"
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={() => onDenyRequest(group.id, userId)}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default ManageRequests;
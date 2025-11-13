import React, { useState } from 'react';
import { Profile as User } from '../../../types';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';

interface ProfileViewProps {
    user: User;
    onLogout: () => Promise<void>;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout }) => {
    const [name, setName] = useState(user.name);
    const [password, setPassword] = useState('');
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    const handleLogoutClick = async () => {
        setIsLoggingOut(true);
        try {
            await onLogout();
        } catch (error) {
            setIsLoggingOut(false);
        }
    };
    
    return (
        <Card className="max-w-2xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold mb-6">My Profile</h1>
            <form className="space-y-4">
                 <div className="flex items-center space-x-4">
                    <img src={user.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`} alt={name} className="w-24 h-24 rounded-full object-cover"/>
                    <Button variant="secondary">Change Avatar</Button>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-text-secondary">Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 form-input" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-text-secondary">Email</label>
                    <input type="email" value={user.email} className="mt-1 form-input bg-sidebar-accent" readOnly />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary">New Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current password" className="mt-1 form-input" />
                </div>
                <div className="pt-4 flex items-center justify-between">
                    <Button type="submit" variant="primary">Save Profile</Button>
                    <Button type="button" variant="danger" onClick={handleLogoutClick} disabled={isLoggingOut}>
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default ProfileView;

import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Profile as User } from '../../../types';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';

interface ProfileViewProps {
    user: User;
    onLogout: () => Promise<void>;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout }) => {
    const [name, setName] = useState(user.name);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const { error } = await supabase.from('profiles').update({ name }).eq('id', user.id);
        if (error) {
            alert('Error updating profile: ' + error.message);
        } else {
            alert('Profile updated!');
        }
        setIsSaving(false);
    };

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
            <form className="space-y-4" onSubmit={handleSave}>
                 <div className="flex items-center space-x-4">
                    <img src={user.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`} alt={name} className="w-24 h-24 rounded-full object-cover"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-text-secondary">Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 form-input" disabled={isSaving}/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-text-secondary">Email</label>
                    <input type="email" value={user.email} className="mt-1 form-input bg-sidebar-accent" readOnly />
                </div>
                <div className="pt-4 flex items-center justify-between">
                    <Button type="submit" variant="primary" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Profile'}
                    </Button>
                    <Button type="button" variant="danger" onClick={handleLogoutClick} disabled={isLoggingOut}>
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </Button>
                </div>
            </form>
        </Card>
    );
};

export default ProfileView;

import React, { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Profile as User, Content, Organization, UserProgress, NewsItem, Playlist, QAndAItem } from '../../types';
import { sendReadStatement } from '../../lib/xapi';
import { HomeIcon, NewsIcon, ContentIcon, PlaylistIcon, ActivityIcon, AnalyticsIcon, QAIcon, ProfileIcon, AlleyeFullLogo, SearchIcon, MenuIcon } from '../../constants';
import ContentPlayerModal from './player/ContentPlayerModal';
import AskQuestionModal from './components/AskQuestionModal';
import { fetchRecommendations } from '../../lib/gemini';
import UserProfileDropdown from '../../components/common/UserProfileDropdown';


// --- ICONS ---
const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>);

// LAZY LOAD VIEWS
const HomeView = lazy(() => import('./views/HomeView'));
const ThreatIntelView = lazy(() => import('./views/ThreatIntelView'));
const LibraryView = lazy(() => import('./views/LibraryView'));
const PlaylistsView = lazy(() => import('./views/PlaylistsView'));
const ActivityView = lazy(() => import('./views/ActivityView'));
const AnalyticsView = lazy(() => import('./views/AnalyticsView'));
const QAView = lazy(() => import('./views/QAView'));
const ProfileView = lazy(() => import('./views/ProfileView'));


interface UserDashboardProps {
  currentUser: User;
  organization?: Organization;
  onLogout: () => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ currentUser: initialUser, organization, onLogout, theme, toggleTheme }) => {
    const [currentUser, setCurrentUser] = useState(initialUser);
    const [activeView, setActiveView] = useState('Home');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const [allContent, setAllContent] = useState<Content[]>([]);
    const [allPlaylists, setAllPlaylists] = useState<Playlist[]>([]);
    const [assignedContent, setAssignedContent] = useState<Content[]>([]);
    const [assignedPlaylists, setAssignedPlaylists] = useState<Playlist[]>([]);
    const [updates, setUpdates] = useState<NewsItem[]>([]);
    const [qandaItems, setQandaItems] = useState<QAndAItem[]>([]);
    const [recommendations, setRecommendations] = useState<{content: Content; reason: string}[] | null>(null);
    const [recLoading, setRecLoading] = useState(true);
    const [recError, setRecError] = useState<string | null>(null);
    
    const [playingContent, setPlayingContent] = useState<Content | null>(null);
    const [isAskModalOpen, setIsAskModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const orgId = currentUser.organization_id;
                const assignmentFilter = orgId ? `or(assigned_org_ids.is.null,assigned_org_ids.eq.{},assigned_org_ids.cs.{${orgId}})` : `or(assigned_org_ids.is.null,assigned_org_ids.eq.{})`;

                const [contentRes, playlistsRes, updatesRes, qandaRes, assignmentsRes] = await Promise.all([
                    supabase.from('content').select('*').or(assignmentFilter),
                    supabase.from('playlists').select('*, playlist_content(content_id)').or(assignmentFilter),
                    supabase.from('news').select('*, author:profiles(name)').order('created_at', { ascending: false }).limit(5),
                    supabase.from('qanda').select('*, user:profiles(name, avatar_url), admin:profiles!answered_by(name)').order('created_at', { ascending: false }),
                    supabase.from('user_assignments').select('*').eq('user_id', currentUser.id),
                ]);

                if (contentRes.data) setAllContent(contentRes.data);
                if (updatesRes.data) setUpdates(updatesRes.data.map((n:any) => ({...n, author: n.author || {name: 'Unknown'}})));
                if (qandaRes.data) setQandaItems(qandaRes.data as any[]);
                
                if (playlistsRes.data) {
                    const playlistsData = playlistsRes.data.map((p: any) => ({ ...p, contentIds: p.playlist_content.map((pc: any) => pc.content_id)}));
                    setAllPlaylists(playlistsData);
                }

                if (contentRes.data && playlistsRes.data && assignmentsRes.data) {
                    const assignedContentIds = new Set(assignmentsRes.data.filter(a => a.content_id).map(a => a.content_id));
                    const assignedPlaylistIds = new Set(assignmentsRes.data.filter(a => a.playlist_id).map(a => a.playlist_id));
                    
                    const pPlaylists = (playlistsRes.data || []).filter(p => assignedPlaylistIds.has(p.id));
                    setAssignedPlaylists(pPlaylists.map((p: any) => ({ ...p, contentIds: p.playlist_content.map((pc: any) => pc.content_id)})));

                    pPlaylists.forEach((p: any) => p.playlist_content.forEach((pc: any) => assignedContentIds.add(pc.content_id)));

                    setAssignedContent(contentRes.data.filter(c => assignedContentIds.has(c.id)));
                }

            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        
        const profileSubscription = supabase.channel(`public:profiles:id=eq.${currentUser.id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${currentUser.id}` }, (payload) => {
                setCurrentUser(prev => ({...prev, ...payload.new as User}));
            }).subscribe();
            
        return () => {
             supabase.removeChannel(profileSubscription);
        }
    }, [currentUser.id, currentUser.organization_id]);
    
    const getRecommendations = useCallback(async () => {
        setRecLoading(true);
        setRecError(null);
        try {
            const recs = await fetchRecommendations(currentUser.progress || {}, allContent);
            setRecommendations(recs);
        } catch (error: any) {
            console.error("Error fetching recommendations:", error);
            setRecError("Could not fetch recommendations at this time.");
        } finally {
            setRecLoading(false);
        }
    }, [currentUser.progress, allContent]);

    useEffect(() => {
        if (!loading && allContent.length > 0) {
            getRecommendations();
        }
    }, [loading, allContent, getRecommendations]);
    
    const handleProgressUpdate = useCallback(async (contentId: number, score?: number) => {
        const newProgressData = { status: 'completed' as const, ...(score !== undefined && { score }) };
        const updatedProgress = { ...currentUser.progress, [contentId]: newProgressData };
        const { error } = await supabase.from('profiles').update({ progress: updatedProgress }).eq('id', currentUser.id);
        if (error) console.error("Error updating progress:", error);
    }, [currentUser.id, currentUser.progress]);

    const handleNewsRead = (item: NewsItem) => {
        sendReadStatement(currentUser, item);
        setActiveView('Threat Intel');
    };

    const handlePlayContent = (content: Content) => setPlayingContent(content);

    const featuredContent = useMemo(() => assignedContent[0], [assignedContent]);
    const continueLearning = useMemo(() => assignedContent.filter(c => currentUser.progress?.[c.id]?.status === 'in-progress'), [assignedContent, currentUser.progress]);
    const newContent = useMemo(() => assignedContent.filter(c => !currentUser.progress?.[c.id]), [assignedContent, currentUser.progress]);
    const themeColor = organization?.theme_color || 'var(--primary-color)';

    const navItems = [
        { name: 'Home', icon: HomeIcon },
        { name: 'Threat Intel', icon: NewsIcon },
        { name: 'Library', icon: ContentIcon },
        { name: 'Playlists', icon: PlaylistIcon },
        { name: 'My Activity', icon: ActivityIcon },
        { name: 'My Analytics', icon: AnalyticsIcon },
        { name: 'Q&A', icon: QAIcon },
        { name: 'Profile', icon: ProfileIcon },
    ];
    
    const renderView = () => {
        let viewComponent;
        switch(activeView) {
            case 'Home':
                viewComponent = <HomeView featuredContent={featuredContent} continueLearning={continueLearning} newContent={newContent} recommendations={recommendations} updates={updates} onPlay={handlePlayContent} onNewsRead={handleNewsRead} loading={loading} recLoading={recLoading} recError={recError} userProgress={currentUser.progress} />;
                break;
            case 'Threat Intel':
                viewComponent = <ThreatIntelView updates={updates} onRead={handleNewsRead} />;
                break;
            case 'Library':
                viewComponent = <LibraryView content={assignedContent} onPlay={handlePlayContent} progress={currentUser.progress} />;
                break;
            case 'Playlists':
                viewComponent = <PlaylistsView playlists={assignedPlaylists} allContent={allContent} onPlay={handlePlayContent} progress={currentUser.progress} />;
                break;
            case 'My Activity':
                viewComponent = <ActivityView user={currentUser} allContent={allContent} />;
                break;
            case 'My Analytics':
                viewComponent = <AnalyticsView user={currentUser} allContent={allContent} />;
                break;
            case 'Q&A':
                viewComponent = <QAView userQanda={qandaItems.filter(i => i.user_id === currentUser.id)} faqItems={qandaItems.filter(i => i.is_faq)} onAsk={() => setIsAskModalOpen(true)} />;
                break;
            case 'Profile':
                viewComponent = <ProfileView user={currentUser} onLogout={onLogout} />;
                break;
            default:
                viewComponent = <HomeView featuredContent={featuredContent} continueLearning={continueLearning} newContent={newContent} recommendations={recommendations} updates={updates} onPlay={handlePlayContent} onNewsRead={handleNewsRead} loading={loading} recLoading={recLoading} recError={recError} userProgress={currentUser.progress} />;
        }
        return <Suspense fallback={<div className="flex h-full w-full items-center justify-center">Loading {activeView}...</div>}>{viewComponent}</Suspense>;
    }
    
    return (
        <div className="flex h-screen bg-background text-text-main">
            {/* Mobile overlay */}
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>
            
            {/* Sidebar */}
            <aside className={`w-64 flex-shrink-0 bg-sidebar border-r border-border flex flex-col fixed inset-y-0 left-0 z-30 md:relative md:translate-x-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
                <div className="h-20 flex items-center justify-center px-4 border-b border-border">
                    {organization?.logo_url ? (
                        <img src={organization.logo_url} alt={organization.name} className="h-10 max-w-full object-contain" />
                    ) : (
                        <AlleyeFullLogo className="text-text-main h-8" />
                    )}
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map(item => (
                        <button key={item.name} onClick={() => { setActiveView(item.name); setIsSidebarOpen(false); }} className={`w-full flex items-center px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 ${activeView === item.name ? 'text-highlight' : 'text-text-secondary hover:bg-sidebar-accent hover:text-text-main'}`} style={activeView === item.name ? { color: themeColor } : {}}>
                            <item.icon className="mr-4 h-5 w-5" />
                            <span>{item.name}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 flex-shrink-0 bg-sidebar/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-text-secondary md:hidden"><MenuIcon className="h-6 w-6" /></button>
                    <div className="relative hidden md:block">
                        <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                        <input type="text" placeholder="Search content..." className="form-input bg-sidebar-accent pl-10 w-64 !py-2" />
                    </div>
                    <UserProfileDropdown
                        user={currentUser}
                        onLogout={onLogout}
                        onProfileClick={() => setActiveView('Profile')}
                        theme={theme}
                        toggleTheme={toggleTheme}
                    />
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {renderView()}
                </main>
            </div>
            {playingContent && <ContentPlayerModal isOpen={!!playingContent} onClose={() => setPlayingContent(null)} content={playingContent} user={currentUser} onProgressUpdate={handleProgressUpdate} />}
            <AskQuestionModal isOpen={isAskModalOpen} onClose={() => setIsAskModalOpen(false)} currentUser={currentUser} />
        </div>
    );
};

export default UserDashboard;
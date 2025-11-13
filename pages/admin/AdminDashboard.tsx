import React, { useState, useEffect, lazy, Suspense } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Profile as User, Content, NewsItem, AnalyticsRecord, Playlist, Organization, CyberTrainingAnalyticsRecord, QAndAItem } from '../../types';
import { HomeIcon, ContentIcon, NewsIcon, AnalyticsIcon, ProfileIcon, UsersIcon, OrganizationIcon, PlaylistIcon, MenuIcon, QAIcon, SearchIcon } from '../../constants';
import UserProfileDropdown from '../../components/common/UserProfileDropdown';

// Lazy load view components
const DashboardView = lazy(() => import('./views/DashboardView'));
const ContentManagementView = lazy(() => import('./views/ContentManagementView'));
const PlaylistManagementView = lazy(() => import('./views/PlaylistManagementView'));
const ThreatIntelView = lazy(() => import('./views/ThreatIntelView'));
const OrganizationManagementView = lazy(() => import('./views/OrganizationManagementView'));
const UserManagementView = lazy(() => import('./views/UserManagementView'));
const QAManagementView = lazy(() => import('./views/QAManagementView'));
const AnalyticsView = lazy(() => import('./views/AnalyticsView'));
const ProfileView = lazy(() => import('./views/ProfileView'));


interface AdminDashboardProps {
  currentUser: User;
  onLogout: () => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onLogout, theme, toggleTheme }) => {
  const [activeView, setActiveView] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [viewLoading, setViewLoading] = useState(false);

  const [updatesItems, setUpdatesItems] = useState<NewsItem[]>([]);
  const [contentItems, setContentItems] = useState<Content[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsRecord[]>([]);
  const [cyberAnalytics, setCyberAnalytics] = useState<CyberTrainingAnalyticsRecord[]>([]);
  const [qandaItems, setQandaItems] = useState<QAndAItem[]>([]);
  
  const [dashboardStats, setDashboardStats] = useState({ userCount: 0, contentCount: 0, playlistCount: 0, organizationCount: 0 });
  const [pendingQandaCount, setPendingQandaCount] = useState(0);
  
  const [dataLoaded, setDataLoaded] = useState({
    content: false,
    playlists: false,
    updates: false,
    organizations: false,
    users: false,
    qanda: false,
    analytics: false,
  });

  useEffect(() => {
    const fetchInitialData = async () => {
        setInitialLoading(true);
        const [
            usersRes,
            contentRes,
            playlistsRes,
            orgsRes,
            updatesRes,
            qandaRes,
        ] = await Promise.all([
            supabase.from('profiles').select('id', { count: 'exact', head: true }),
            supabase.from('content').select('id', { count: 'exact', head: true }),
            supabase.from('playlists').select('id', { count: 'exact', head: true }),
            supabase.from('organizations').select('id', { count: 'exact', head: true }),
            supabase.from('news').select('*, author:profiles(name)').order('created_at', { ascending: false }).limit(3),
            supabase.from('qanda').select('id', { count: 'exact', head: true }).is('answer', null),
        ]);

        setDashboardStats({
            userCount: usersRes.count ?? 0,
            contentCount: contentRes.count ?? 0,
            playlistCount: playlistsRes.count ?? 0,
            organizationCount: orgsRes.count ?? 0,
        });

        if (updatesRes.data) setUpdatesItems(updatesRes.data.map((n: any) => ({...n, author: n.author || {name: 'Unknown'}})));
        setPendingQandaCount(qandaRes.count ?? 0);

        setInitialLoading(false);
    };
    fetchInitialData();
  }, []);
  
  useEffect(() => {
    const loadViewData = async () => {
        setViewLoading(true);
        switch(activeView) {
            case 'Content':
                if (!dataLoaded.content) {
                    const { data } = await supabase.from('content').select('*').order('created_at', { ascending: false });
                    if (data) setContentItems(data);
                    setDataLoaded(p => ({...p, content: true}));
                }
                break;
            case 'Playlists':
                if (!dataLoaded.playlists) {
                    const { data } = await supabase.from('playlists').select('*, playlist_content(content_id)').order('created_at', { ascending: false });
                    if (data) {
                        const playlistsData = data.map((p: any) => ({
                            ...p, contentIds: p.playlist_content.map((pc: any) => pc.content_id), playlist_content: undefined,
                        }));
                        setPlaylists(playlistsData);
                    }
                    setDataLoaded(p => ({...p, playlists: true}));
                }
                if (!dataLoaded.content) { // Dependency for PlaylistFormModal
                    const { data } = await supabase.from('content').select('*').order('created_at', { ascending: false });
                    if (data) setContentItems(data);
                    setDataLoaded(p => ({...p, content: true}));
                }
                break;
            case 'Threat Intel':
                if (!dataLoaded.updates) {
                    const { data } = await supabase.from('news').select('*, author:profiles(name)').order('created_at', { ascending: false });
                    if (data) setUpdatesItems(data.map((n: any) => ({...n, author: n.author || {name: 'Unknown'}})));
                    setDataLoaded(p => ({...p, updates: true}));
                }
                break;
            case 'Organizations':
                if (!dataLoaded.organizations) {
                    const { data: orgs } = await supabase.from('organizations').select('*');
                    if(orgs) setOrganizations(orgs);
                    setDataLoaded(p => ({...p, organizations: true}));
                }
                if(!dataLoaded.users) {
                    const { data: usersData } = await supabase.from('profiles').select('*');
                    if(usersData) setUsers(usersData);
                    setDataLoaded(p => ({...p, users: true}));
                }
                break;
            case 'Users':
                if (!dataLoaded.users) {
                    const { data } = await supabase.from('profiles').select('*');
                    if (data) setUsers(data);
                    setDataLoaded(p => ({...p, users: true}));
                }
                if (!dataLoaded.organizations) {
                  const { data } = await supabase.from('organizations').select('*');
                  if (data) setOrganizations(data);
                  setDataLoaded(p => ({...p, organizations: true}));
                }
                break;
            case 'Q&A':
                if (!dataLoaded.qanda) {
                    const { data } = await supabase.from('qanda').select('*, user:profiles(name, avatar_url), admin:profiles!answered_by(name)').order('created_at', { ascending: false });
                    if (data) setQandaItems(data as any[]);
                    setDataLoaded(p => ({...p, qanda: true}));
                }
                break;
            case 'Analytics':
                 if (!dataLoaded.analytics) {
                    const [analyticsRes, cyberAnalyticsRes] = await Promise.all([
                        supabase.from('analytics').select('*').order('timestamp', { ascending: false }),
                        supabase.from('cyber_training_analytics').select('*').order('completed_at', { ascending: false })
                    ]);
                    if (analyticsRes.data) setAnalytics(analyticsRes.data);
                    if (cyberAnalyticsRes.data) setCyberAnalytics(cyberAnalyticsRes.data);
                    setDataLoaded(p => ({...p, analytics: true}));
                }
                // Dependencies for Analytics view
                if (!dataLoaded.content) {
                    const { data } = await supabase.from('content').select('*');
                    if (data) setContentItems(prev => [...prev, ...data.filter(newItem => !prev.some(existing => existing.id === newItem.id))]);
                    setDataLoaded(p => ({...p, content: true}));
                }
                if (!dataLoaded.organizations) {
                    const { data } = await supabase.from('organizations').select('*');
                    if (data) setOrganizations(data);
                    setDataLoaded(p => ({...p, organizations: true}));
                }
                if (!dataLoaded.users) {
                    const { data } = await supabase.from('profiles').select('*');
                    if (data) setUsers(data);
                    setDataLoaded(p => ({...p, users: true}));
                }
                break;
        }
        setViewLoading(false);
    };
    if (activeView !== 'Dashboard' && !initialLoading) loadViewData();
  }, [activeView, initialLoading]);

  useEffect(() => {
    const channels: ReturnType<typeof supabase.channel>[] = [];
    const setupSubscription = (table: string, handler: (payload: any) => void) => {
      const channel = supabase.channel(`public:${table}`).on('postgres_changes', { event: '*', schema: 'public', table }, handler).subscribe();
      channels.push(channel);
    };

    setupSubscription('analytics', (payload) => { if (payload.eventType === 'INSERT') setAnalytics((prev) => [payload.new as AnalyticsRecord, ...prev]); });
    setupSubscription('cyber_training_analytics', (payload) => { if (payload.eventType === 'INSERT') setCyberAnalytics((prev) => [payload.new as CyberTrainingAnalyticsRecord, ...prev]); });
    setupSubscription('profiles', (payload) => {
      if (payload.eventType === 'INSERT') setUsers(prev => [payload.new as User, ...prev]);
      else if (payload.eventType === 'UPDATE') setUsers(prev => prev.map(u => u.id === payload.new.id ? payload.new as User : u));
      else if (payload.eventType === 'DELETE') setUsers(prev => prev.filter(u => u.id !== (payload.old as any).id));
      setDashboardStats(prev => ({...prev, userCount: payload.eventType === 'INSERT' ? prev.userCount + 1 : (payload.eventType === 'DELETE' ? prev.userCount - 1 : prev.userCount)}));
    });
    setupSubscription('news', async (payload) => {
      const handleUpsert = async (record: any) => {
        const { data: author } = await supabase.from('profiles').select('name').eq('id', record.author_id).single();
        return { ...record, author: author || { name: 'Unknown' } } as NewsItem;
      };
      if (payload.eventType === 'INSERT') {
        const newItem = await handleUpsert(payload.new);
        setUpdatesItems(prev => [newItem, ...prev].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } else if (payload.eventType === 'UPDATE') {
        const updatedItem = await handleUpsert(payload.new);
        setUpdatesItems(prev => prev.map(item => item.id === payload.new.id ? updatedItem : item));
      } else if (payload.eventType === 'DELETE') setUpdatesItems(prev => prev.filter(item => item.id !== (payload.old as any).id));
    });
    setupSubscription('content', (payload) => {
      if (payload.eventType === 'INSERT') setContentItems(prev => [payload.new as Content, ...prev]);
      else if (payload.eventType === 'UPDATE') setContentItems(prev => prev.map(c => c.id === payload.new.id ? payload.new as Content : c));
      else if (payload.eventType === 'DELETE') setContentItems(prev => prev.filter(c => c.id !== (payload.old as any).id));
      setDashboardStats(prev => ({...prev, contentCount: payload.eventType === 'INSERT' ? prev.contentCount + 1 : (payload.eventType === 'DELETE' ? prev.contentCount - 1 : prev.contentCount)}));
    });
    setupSubscription('playlists', async (payload) => {
        const handleUpsert = async (record: any) => {
            const { data } = await supabase.from('playlist_content').select('content_id').eq('playlist_id', record.id);
            return { ...record, contentIds: data?.map(pc => pc.content_id) || [] };
        };
        if (payload.eventType === 'INSERT') { const newItem = await handleUpsert(payload.new); setPlaylists(prev => [newItem, ...prev]); } 
        else if (payload.eventType === 'UPDATE') { const updatedItem = await handleUpsert(payload.new); setPlaylists(prev => prev.map(p => p.id === payload.new.id ? updatedItem : p)); } 
        else if (payload.eventType === 'DELETE') { setPlaylists(prev => prev.filter(p => p.id !== (payload.old as any).id)); }
        if (payload.eventType !== 'UPDATE') setDashboardStats(prev => ({...prev, playlistCount: payload.eventType === 'INSERT' ? prev.playlistCount + 1 : (payload.eventType === 'DELETE' ? prev.playlistCount - 1 : prev.playlistCount)}));
    });
    setupSubscription('organizations', (payload) => {
        if (payload.eventType === 'INSERT') setOrganizations(prev => [payload.new as Organization, ...prev]);
        else if (payload.eventType === 'UPDATE') setOrganizations(prev => prev.map(o => o.id === payload.new.id ? payload.new as Organization : o));
        else if (payload.eventType === 'DELETE') setOrganizations(prev => prev.filter(o => o.id !== (payload.old as any).id));
        setDashboardStats(prev => ({...prev, organizationCount: payload.eventType === 'INSERT' ? prev.organizationCount + 1 : (payload.eventType === 'DELETE' ? prev.organizationCount - 1 : prev.organizationCount)}));
    });
    setupSubscription('qanda', async (payload) => {
        const handleUpsert = async (record: any) => {
            const { data: user } = await supabase.from('profiles').select('name, avatar_url').eq('id', record.user_id).single();
            const { data: admin } = record.answered_by ? await supabase.from('profiles').select('name').eq('id', record.answered_by).single() : { data: null };
            return { ...record, user, admin } as QAndAItem;
        };
        if (payload.eventType === 'INSERT') { const newItem = await handleUpsert(payload.new); setQandaItems(prev => [newItem, ...prev].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())); }
        else if (payload.eventType === 'UPDATE') { const updatedItem = await handleUpsert(payload.new); setQandaItems(prev => prev.map(item => item.id === payload.new.id ? updatedItem : item)); }
        else if (payload.eventType === 'DELETE') { setQandaItems(prev => prev.filter(item => item.id !== (payload.old as any).id)); }
    });

    return () => { channels.forEach(channel => supabase.removeChannel(channel)); };
  }, []);

  const renderView = () => {
    let viewComponent = null;

    switch (activeView) {
      case 'Dashboard':
        viewComponent = <DashboardView currentUser={currentUser} stats={dashboardStats} updates={updatesItems} setUpdates={setUpdatesItems} pendingQandaCount={pendingQandaCount} setActiveView={setActiveView} />;
        break;
      case 'Content':
        viewComponent = <ContentManagementView content={contentItems} setContent={setContentItems} currentUser={currentUser} allOrganizations={organizations} />;
        break;
      case 'Playlists':
        viewComponent = <PlaylistManagementView playlists={playlists} setPlaylists={setPlaylists} allContent={contentItems} currentUser={currentUser} allOrganizations={organizations}/>;
        break;
      case 'Threat Intel':
        viewComponent = <ThreatIntelView updates={updatesItems} setUpdates={setUpdatesItems} currentUser={currentUser} />;
        break;
      case 'Organizations':
        viewComponent = <OrganizationManagementView organizations={organizations} setOrganizations={setOrganizations} users={users} setUsers={setUsers} />;
        break;
      case 'Users':
        viewComponent = <UserManagementView users={users} setUsers={setUsers} organizations={organizations} currentUser={currentUser} />;
        break;
      case 'Q&A':
        viewComponent = <QAManagementView qandaItems={qandaItems} currentUser={currentUser} />;
        break;
      case 'Analytics':
        viewComponent = <AnalyticsView analytics={analytics} cyberAnalytics={cyberAnalytics} content={contentItems} organizations={organizations} users={users} />;
        break;
      case 'Profile':
        viewComponent = <ProfileView user={currentUser} onLogout={onLogout} />;
        break;
      default:
        viewComponent = <DashboardView currentUser={currentUser} stats={dashboardStats} updates={updatesItems} setUpdates={setUpdatesItems} pendingQandaCount={pendingQandaCount} setActiveView={setActiveView} />;
    }
    
    return <Suspense fallback={<div className="flex h-full w-full items-center justify-center">Loading {activeView}...</div>}>{viewComponent}</Suspense>
  };
  
    const navItems = [
      { name: 'Dashboard', icon: HomeIcon },
      { name: 'Content', icon: ContentIcon },
      { name: 'Playlists', icon: PlaylistIcon },
      { name: 'Threat Intel', icon: NewsIcon },
      { name: 'Organizations', icon: OrganizationIcon },
      { name: 'Users', icon: UsersIcon },
      { name: 'Q&A', icon: QAIcon },
      { name: 'Analytics', icon: AnalyticsIcon },
      { name: 'Profile', icon: ProfileIcon },
  ];

  return (
    <div className="flex h-screen bg-base-100 text-base-content">
       <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={() => setIsSidebarOpen(false)}></div>

      <aside className={`w-64 flex-shrink-0 bg-base-200 border-r border-base-300 flex flex-col fixed inset-y-0 left-0 z-30 md:relative md:translate-x-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="h-20 flex items-center justify-center px-4 border-b border-base-300">
          <h1 className="text-xl font-bold">ALL EYE</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <button key={item.name} onClick={() => { setActiveView(item.name); setIsSidebarOpen(false); }} className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeView === item.name ? 'bg-primary/20 text-primary' : 'text-base-content/70 hover:bg-base-300'}`}>
              <item.icon className="mr-3 h-5 w-5" />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
          <header className="navbar bg-base-200/80 backdrop-blur-md border-b border-base-300 sticky top-0 z-10 h-20">
              <div className="navbar-start">
                  <button onClick={() => setIsSidebarOpen(true)} className="btn btn-ghost btn-circle md:hidden">
                      <MenuIcon className="h-6 w-6" />
                  </button>
                  <label className="input input-bordered flex items-center gap-2 hidden md:flex">
                    <SearchIcon className="w-4 h-4 opacity-70" />
                    <input type="text" className="grow" placeholder="Search" />
                  </label>
              </div>
              <div className="navbar-end">
                  <UserProfileDropdown 
                    user={currentUser}
                    onLogout={onLogout}
                    onProfileClick={() => setActiveView('Profile')}
                    theme={theme}
                    toggleTheme={toggleTheme}
                  />
              </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {initialLoading ? (
                <div className="flex h-full w-full items-center justify-center">
                    <span className="loading loading-lg"></span>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto">
                    {viewLoading ? <div className="flex h-full w-full items-center justify-center"><span className="loading loading-lg"></span></div> : renderView()}
                </div>
            )}
          </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
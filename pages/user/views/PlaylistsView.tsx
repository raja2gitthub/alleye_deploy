import React, { useState } from 'react';
import { Playlist, Content, UserProgress } from '../../../types';
import ContentCard from '../components/ContentCard';
import Card from '../../../components/common/Card';

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>);

const PlaylistsView: React.FC<{
    playlists: Playlist[];
    allContent: Content[];
    onPlay: (content: Content) => void;
    progress?: UserProgress;
}> = ({ playlists, allContent, onPlay, progress }) => {

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6">My Playlists</h1>
            <div className="space-y-4">
                {playlists.map(playlist => {
                    const playlistContent = playlist.contentIds.map(id => allContent.find(c => c.id === id)).filter((c): c is Content => !!c);
                    const completedCount = playlistContent.filter(c => progress?.[c.id]?.status === 'completed').length;
                    const totalCount = playlistContent.length;
                    const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                    return (
                        <div key={playlist.id} className="collapse collapse-arrow bg-base-200 shadow-lg">
                            <input type="radio" name="my-accordion-2" /> 
                            <div className="collapse-title text-xl font-medium flex items-center justify-between">
                                <div>
                                    <h2>{playlist.name}</h2>
                                    <p className="text-sm font-normal opacity-70">{playlist.description}</p>
                                </div>
                                <div className="flex items-center gap-4 w-48">
                                    <progress className="progress progress-primary w-full" value={completionPercent} max="100"></progress>
                                    <span className="text-sm font-semibold">{completionPercent}%</span>
                                </div>
                            </div>
                            <div className="collapse-content"> 
                                <div className="p-4 border-t border-base-300 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {playlistContent.map(item => (
                                        <ContentCard 
                                            key={item.id} 
                                            item={item} 
                                            onPlay={onPlay}
                                            status={progress?.[item.id]?.status || 'not-started'}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
                 {playlists.length === 0 && (
                    <Card><p>You are not assigned to any playlists yet.</p></Card>
                )}
            </div>
        </div>
    );
};

export default PlaylistsView;
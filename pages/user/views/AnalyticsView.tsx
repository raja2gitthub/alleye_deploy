import React, { useEffect, useState, useMemo } from 'react';
import { Profile as User, Content } from '../../../types';
import { fetchStatements } from '../../../lib/xapiLrsClient';
import Card from '../../../components/common/Card';
import ViewHeader from '../../lead/components/ViewHeader'; 
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import DataTable from '../../../components/common/DataTable';

// Icons for the stats cards
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const ChartBarIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>);
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <Card>
        <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-lg text-primary">
                {icon}
            </div>
            <div>
                <div className="text-3xl font-bold">{value}</div>
                <div className="text-sm opacity-70">{title}</div>
            </div>
        </div>
    </Card>
);

const AnalyticsView: React.FC<{ user: User, allContent: Content[] }> = ({ user, allContent }) => {
    const [statements, setStatements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const data = await fetchStatements({ agent: user, limit: 100 });
            setStatements(data);
            setLoading(false);
        };
        loadData();
    }, [user]);

    const analyticsData = useMemo(() => {
        const progress = user.progress || {};
        const completedEntries = Object.entries(progress).filter(([_, p]) => p.status === 'completed');
        
        const scores = completedEntries.map(([_, p]) => p.score).filter((s): s is number => s !== undefined);
        const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
        
        const completedContentIds = new Set(completedEntries.map(([id, _]) => parseInt(id)));
        const totalLearningTime = allContent
            .filter(c => completedContentIds.has(c.id))
            .reduce((sum, c) => sum + (c.duration_sec || 0), 0);
        const totalMinutes = Math.floor(totalLearningTime / 60);

        const scoresByCategory: { [key: string]: number[] } = {};
        allContent.forEach(content => {
            const prog = progress[content.id];
            if (prog?.status === 'completed' && typeof prog.score === 'number' && content.category) {
                if (!scoresByCategory[content.category]) {
                    scoresByCategory[content.category] = [];
                }
                scoresByCategory[content.category].push(prog.score);
            }
        });

        const categoryProficiency = Object.entries(scoresByCategory).map(([category, catScores]) => ({
            subject: category,
            A: catScores.reduce((a, b) => a + b, 0) / catScores.length,
            fullMark: 100,
        })).slice(0, 6);

        const quizPerformances = completedEntries
            .map(([contentId, prog]) => {
                if (typeof prog.score === 'number') {
                    const content = allContent.find(c => c.id === parseInt(contentId));
                    return content ? { ...content, id: content.id, score: prog.score, passing_score: content.passing_score ?? 70 } : null;
                }
                return null;
            })
            .filter((item): item is Content & { score: number, passing_score: number } => !!item);

        return {
            stats: {
                completed: completedEntries.length,
                avgScore: avgScore.toFixed(0),
                learningTime: totalMinutes,
            },
            categoryProficiency,
            quizPerformances
        };
    }, [user.progress, allContent]);
    
    const recentActivities = useMemo(() => {
        return statements.slice(0, 5).map(s => ({
            id: s.id,
            verb: s.verb.display['en-US'] || 'did',
            object: s.object.definition?.name?.['en-US'] || 'something',
            timestamp: new Date(s.timestamp).toLocaleString()
        }));
    }, [statements]);
    
    if (loading) return <div className="flex h-full w-full items-center justify-center"><span className="loading loading-lg"></span></div>;

    return (
        <div className="animate-fade-in space-y-6">
            <ViewHeader title="My Analytics Dashboard" subtitle={`Here's a detailed look at your learning journey, ${user.name}.`} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Courses Completed" value={analyticsData.stats.completed.toString()} icon={<CheckCircleIcon className="w-8 h-8"/>} />
                <StatCard title="Average Score" value={`${analyticsData.stats.avgScore}%`} icon={<ChartBarIcon className="w-8 h-8"/>} />
                <StatCard title="Total Learning Time" value={`${analyticsData.stats.learningTime} min`} icon={<ClockIcon className="w-8 h-8"/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
                    {recentActivities.length > 0 ? (
                        <ul className="space-y-4">
                            {recentActivities.map(activity => (
                                <li key={activity.id} className="flex items-center gap-4 p-3 bg-base-300/50 rounded-lg">
                                    <div className="w-2 h-10 bg-primary rounded-full"></div>
                                    <div>
                                        <p className="font-semibold text-base-content">You {activity.verb} <span className="text-primary">{activity.object}</span></p>
                                        <p className="text-xs opacity-70">{activity.timestamp}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="opacity-70">No recent activity to show.</p>}
                </Card>

                <Card>
                    <h3 className="text-xl font-bold mb-4">Category Proficiency</h3>
                    {analyticsData.categoryProficiency.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={analyticsData.categoryProficiency}>
                                <PolarGrid stroke="hsl(var(--b3))"/>
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--bc))', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--bc))', fontSize: 10 }} />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--b2))', border: '1px solid hsl(var(--b3))'}}/>
                                <Radar name="Average Score" dataKey="A" stroke="hsl(var(--p))" fill="hsl(var(--p))" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    ) : <p className="opacity-70 flex items-center justify-center h-full">Complete some quizzes to see your proficiency.</p>}
                </Card>
            </div>
            
            <Card>
                <h3 className="text-xl font-bold mb-4">Quiz Performance Details</h3>
                <DataTable
                    columns={[
                        { key: 'title', header: 'Quiz Title' },
                        { key: 'category', header: 'Category' },
                        { key: 'score', header: 'Your Score', render: (item) => `${item.score}%` },
                        { key: 'passing_score', header: 'Passing Score', render: (item) => `${item.passing_score}%`},
                        { key: 'status', header: 'Status', render: (item) => (
                            item.score >= item.passing_score ? 
                            <span className="badge badge-success badge-outline">Passed</span> :
                            <span className="badge badge-error badge-outline">Failed</span>
                        )}
                    ]}
                    data={analyticsData.quizPerformances}
                />
            </Card>

        </div>
    );
};

export default AnalyticsView;

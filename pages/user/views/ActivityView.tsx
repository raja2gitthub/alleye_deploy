import React, { useMemo } from 'react';
import { Profile as User, Content, ContentType } from '../../../types';
import Card from '../../../components/common/Card';

const CourseConquerorBadge = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2L9 9l-7 1 5 5-2 7 7-4 7 4-2-7 5-5-7-1z"></path></svg>);

interface ActivityViewProps {
    user: User;
    allContent: Content[];
}

const QuizPerformance: React.FC<{ user: User; allContent: Content[] }> = ({ user, allContent }) => {
  const quizPerformances = useMemo(() => {
    if (!user.progress) return [];

    return Object.entries(user.progress)
      .map(([contentId, progress]) => {
        if (progress.status === 'completed' && typeof progress.score === 'number') {
          const content = allContent.find(c => c.id === parseInt(contentId));
          if (content && [ContentType.QUIZ, ContentType.VIDEO_QUIZ, ContentType.CYBER_SECURITY_TRAINING].includes(content.type)) {
            return {
              id: content.id,
              title: content.title,
              score: progress.score,
              passingScore: content.passing_score ?? 70,
            };
          }
        }
        return null;
      })
      .filter((item): item is { id: number; title: string; score: number; passingScore: number } => item !== null);
  }, [user.progress, allContent]);

  if (quizPerformances.length === 0) {
    return null;
  }

  return (
    <Card className="lg:col-span-3">
      <h2 className="text-xl font-bold mb-6 text-text-main">My Quiz Performance</h2>
      <div className="space-y-6">
        {quizPerformances.map(quiz => {
          const passed = quiz.score >= quiz.passingScore;
          return (
            <div key={quiz.id}>
                <div className="flex justify-between items-center mb-2">
                    <p className="text-text-main font-medium truncate pr-4">{quiz.title}</p>
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${passed ? 'bg-green-800 text-green-200' : 'bg-red-900 text-red-200'}`}>
                          {passed ? 'Passed' : 'Failed'}
                        </span>
                        <span className="text-text-main font-semibold w-12 text-right">{quiz.score}%</span>
                    </div>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${quiz.score}%` }}></div>
                </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};


const ActivityView: React.FC<ActivityViewProps> = ({ user, allContent }) => {
    const badges = [
        { id: 'Course Conqueror', name: 'Course Conqueror', description: 'Complete 5 courses', icon: <CourseConquerorBadge className="w-16 h-16 text-yellow-400" /> },
    ];
    const earnedBadges = badges.filter(b => user.badges?.includes(b.id));

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6">My Activity</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <h2 className="text-xl font-bold mb-4">Stats</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-sidebar-accent rounded-lg">
                            <span className="font-semibold text-text-main">Points Earned</span>
                            <span className="font-bold text-2xl text-highlight">{user.points || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-sidebar-accent rounded-lg">
                            <span className="font-semibold text-text-main">Courses Completed</span>
                            <span className="font-bold text-2xl text-highlight">{Object.values(user.progress || {}).filter(p => p.status === 'completed').length}</span>
                        </div>
                    </div>
                </Card>
                 <Card className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4">Badges</h2>
                    <div className="flex flex-wrap gap-6">
                        {earnedBadges.length > 0 ? (
                           earnedBadges.map(badge => (
                               <div key={badge.id} className="text-center">
                                   {badge.icon}
                                   <p className="font-semibold mt-2">{badge.name}</p>
                                   <p className="text-xs text-text-secondary">{badge.description}</p>
                               </div>
                           ))
                        ) : (
                           <p className="text-text-secondary">No badges earned yet. Keep learning to unlock them!</p> 
                        )}
                    </div>
                 </Card>
                 <QuizPerformance user={user} allContent={allContent} />
            </div>
        </div>
    );
};

export default ActivityView;
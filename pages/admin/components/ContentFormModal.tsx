import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Content, ContentType, Organization, Profile as User, QuizQuestion } from '../../../types';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';

interface ContentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: Content | null;
    currentUser: User;
    allOrganizations: Organization[];
}

const ContentFormModal: React.FC<ContentFormModalProps> = ({ isOpen, onClose, content, currentUser, allOrganizations }) => {
    const [formData, setFormData] = useState<Partial<Content>>({
        title: '',
        description: '',
        type: ContentType.VIDEO,
        content_url: '',
        embed_url: '',
        html_content: '',
        questions: [],
        quiz_data: '',
        tags: [],
        visibility: 'org-wide',
        duration_sec: 0,
        risk_tags: [],
        compliance: [],
        thumbnail_url: '',
        category: '',
        difficulty: 'Intro',
        passing_score: 70,
        assigned_org_ids: [],
        ...content,
    });
    
    const [newQuestion, setNewQuestion] = useState({ question: '', options: ['', '', '', ''], correctAnswer: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const processedValue = name === 'duration_sec' || name === 'passing_score' ? parseInt(value, 10) : value;
        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'tags' | 'risk_tags' | 'compliance') => {
        setFormData(prev => ({ ...prev, [field]: e.target.value.split(',').map(tag => tag.trim()) }));
    };
    
    const handleOrgAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, assigned_org_ids: selectedOptions.includes('all') ? [] : selectedOptions }));
    };

    const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewQuestion(prev => ({ ...prev, [name]: value }));
    };
    
    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...newQuestion.options];
        newOptions[index] = value;
        setNewQuestion(prev => ({ ...prev, options: newOptions }));
    };

    const addQuestion = () => {
        if (newQuestion.question && newQuestion.options.every(opt => opt)) {
            const questionToAdd = { ...newQuestion, id: Date.now() };
            setFormData(prev => ({ ...prev, questions: [...(prev.questions || []), questionToAdd] }));
            setNewQuestion({ question: '', options: ['', '', '', ''], correctAnswer: 0 });
        } else {
            alert('Please fill out the question and all four options.');
        }
    };
    
    const removeQuestion = (id: number) => {
        setFormData(prev => ({ ...prev, questions: prev.questions?.filter(q => q.id !== id) }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const finalData = { 
            ...formData, 
            creator_id: currentUser.id,
            quiz_data: (formData.type === ContentType.CYBER_SECURITY_TRAINING && (formData.questions?.length ?? 0) > 0)
                ? JSON.stringify(formData.questions)
                : formData.quiz_data,
        };
        
        let error;
        if (content?.id) {
            const { error: updateError } = await supabase.from('content').update(finalData).eq('id', content.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase.from('content').insert(finalData);
            error = insertError;
        }

        if (error) {
            alert(`Error saving content: ${error.message}`);
        } else {
            onClose();
        }
        setIsSubmitting(false);
    };

    const quizContentSelected = formData.type === ContentType.VIDEO_QUIZ || formData.type === ContentType.QUIZ || formData.type === ContentType.CYBER_SECURITY_TRAINING;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={content ? 'Edit Content' : 'Add New Content'} size="2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="form-control w-full">
                        <div className="label"><span className="label-text">Title</span></div>
                        <input name="title" value={formData.title} onChange={handleChange} className="input input-bordered w-full" required />
                    </label>
                    <label className="form-control w-full">
                        <div className="label"><span className="label-text">Content Type</span></div>
                        <select name="type" value={formData.type} onChange={handleChange} className="select select-bordered" required>
                            {Object.values(ContentType).map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </label>
                </div>
                <label className="form-control w-full">
                    <div className="label"><span className="label-text">Description</span></div>
                    <textarea name="description" value={formData.description} onChange={handleChange} className="textarea textarea-bordered" />
                </label>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="form-control w-full">
                        <div className="label"><span className="label-text">Category</span></div>
                        <input name="category" value={formData.category} onChange={handleChange} className="input input-bordered w-full" placeholder="e.g., Phishing, Compliance" />
                    </label>
                    <label className="form-control w-full">
                        <div className="label"><span className="label-text">Difficulty</span></div>
                         <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="select select-bordered">
                            <option value="Intro">Intro</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </label>
                </div>
                {formData.type === ContentType.HTML && (
                    <label className="form-control w-full">
                        <div className="label"><span className="label-text">HTML Content</span></div>
                        <textarea name="html_content" value={formData.html_content} onChange={handleChange} className="textarea textarea-bordered font-mono" rows={10}/>
                    </label>
                )}
                {formData.type === ContentType.CYBER_SECURITY_TRAINING && (
                    <label className="form-control w-full">
                        <div className="label"><span className="label-text">Video URL (e.g., Supabase Storage)</span></div>
                        <input name="content_url" value={formData.content_url} onChange={handleChange} className="input input-bordered w-full" placeholder="https://..." />
                    </label>
                )}
                {([ContentType.VIDEO, ContentType.VIDEO_QUIZ].includes(formData.type!) || [ContentType.PDF, ContentType.SCORM, ContentType.HTML5, ContentType.REACT_SANDBOX].includes(formData.type!)) && (
                    <label className="form-control w-full">
                        <div className="label"><span className="label-text">{[ContentType.PDF, ContentType.SCORM, ContentType.HTML5, ContentType.REACT_SANDBOX].includes(formData.type!) ? 'Embed URL' : 'Content URL'}</span></div>
                        <input name={ [ContentType.PDF, ContentType.SCORM, ContentType.HTML5, ContentType.REACT_SANDBOX].includes(formData.type!) ? 'embed_url' : 'content_url'} value={formData.embed_url || formData.content_url} onChange={handleChange} className="input input-bordered w-full" />
                    </label>
                )}
                {quizContentSelected && (
                    <div className="p-4 border border-base-300 rounded-lg space-y-4">
                        <h3 className="font-semibold text-lg">Quiz Questions</h3>
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                             {formData.questions?.map((q, index) => (
                                <div key={q.id} className="bg-base-300/50 p-2 rounded-md">
                                    <p className="text-sm font-semibold flex justify-between">
                                        <span>{index+1}. {q.question}</span>
                                        <button type="button" onClick={() => removeQuestion(q.id)} className="text-error hover:opacity-80">&times;</button>
                                    </p>
                                    <ul className="text-xs list-disc pl-5">
                                        {q.options.map((opt, i) => <li key={i} className={i === q.correctAnswer ? 'font-bold text-success' : ''}>{opt}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2 pt-4 border-t border-base-300">
                             <h4 className="font-semibold">Add New Question</h4>
                            <textarea name="question" value={newQuestion.question} onChange={handleQuestionChange} placeholder="Question text (can be HTML)" className="textarea textarea-bordered w-full" />
                            {newQuestion.options.map((opt, i) => (
                                <input key={i} value={opt} onChange={e => handleOptionChange(i, e.target.value)} placeholder={`Option ${i+1}`} className="input input-bordered w-full" />
                            ))}
                             <select name="correctAnswer" value={newQuestion.correctAnswer} onChange={e => setNewQuestion(p => ({...p, correctAnswer: parseInt(e.target.value)}))} className="select select-bordered w-full">
                                {newQuestion.options.map((_, i) => <option key={i} value={i}>Option {i+1} is correct</option>)}
                            </select>
                            <Button type="button" variant="secondary" onClick={addQuestion}>Add Question</Button>
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="form-control w-full">
                        <div className="label"><span className="label-text">Tags (comma-separated)</span></div>
                        <input name="tags" value={formData.tags?.join(', ')} onChange={(e) => handleTagChange(e, 'tags')} className="input input-bordered w-full" />
                    </label>
                     <label className="form-control w-full">
                        <div className="label"><span className="label-text">Thumbnail URL</span></div>
                        <input name="thumbnail_url" value={formData.thumbnail_url} onChange={handleChange} className="input input-bordered w-full" />
                    </label>
                    <label className="form-control w-full">
                        <div className="label"><span className="label-text">Duration (seconds)</span></div>
                        <input type="number" name="duration_sec" value={formData.duration_sec} onChange={handleChange} className="input input-bordered w-full" />
                    </label>
                    {quizContentSelected && (
                        <label className="form-control w-full">
                            <div className="label"><span className="label-text">Passing Score (%)</span></div>
                            <input type="number" name="passing_score" value={formData.passing_score} onChange={handleChange} className="input input-bordered w-full" />
                        </label>
                    )}
                </div>
                 <label className="form-control w-full">
                    <div className="label"><span className="label-text">Assign to Organizations</span></div>
                    <select
                        multiple
                        name="assigned_org_ids"
                        value={formData.assigned_org_ids?.length === 0 ? ['all'] : formData.assigned_org_ids}
                        onChange={handleOrgAssignmentChange}
                        className="select select-bordered h-32"
                    >
                        <option value="all">All Organizations</option>
                        {allOrganizations.map(org => (
                            <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                    </select>
                    <div className="label"><span className="label-text-alt">Hold Ctrl/Cmd to select multiple. Selecting 'All Organizations' will override other selections.</span></div>
                </label>
                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <span className="loading loading-spinner"></span> : 'Save Content'}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default ContentFormModal;
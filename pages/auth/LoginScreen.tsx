import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Role } from '../../types';
import { GoogleIcon, AzureIcon, OktaIcon } from '../../constants';
import Button from '../../components/common/Button';
import { type Provider } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import LoginScreen from "./pages/auth/LoginScreen";

const LoginScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // For sign up
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);

    const MailIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" /><path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" /></svg>;
    const LockIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" /></svg>;
    const UserIcon = (props: React.SVGProps<SVGSVGElement>) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" /></svg>;

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (isSignUp) {
            let role = Role.USER;
            let company = 'Personal Account';

            if (email === 'admin@lms.com') {
                role = Role.ADMIN;
                company = 'LMS Corp';
            } else if (email === 'ciso@lms.com') {
                role = Role.CISO;
                company = 'LMS Corp';
            } else if (email === 'lead@lms.com') {
                role = Role.LEAD;
                company = 'LMS Corp';
            } else if (email === 'user@lms.com') {
                role = Role.USER;
                company = 'LMS Corp';
            }

            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                        role: role,
                        company: company,
                        points: 0,
                        badges: [],
                        team: 'General',
                        avatar_url: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}`,
                        progress: {}
                    },
                },
            });
            if (error) {
                alert(error.message);
            } else {
                 let successMessage = `Sign up successful for ${role} role! Please check your email to verify your account before logging in.`;
                 if (role === Role.USER && company === 'Personal Account') {
                    successMessage = 'Sign up successful! Please check your email to verify your account.';
                 }
                alert(successMessage);
                setIsSignUp(false);
                setName('');
                setEmail('');
                setPassword('');
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                alert(error.message);
            }
        }
        setLoading(false);
    };

    const handleAuthProviderClick = async (provider: 'google' | 'azure' | 'okta') => {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider as Provider,
            options: {
                skipBrowserRedirect: true,
            }
        });

        if (error) {
            alert(`Error during authentication: ${error.message}`);
            setLoading(false);
        } else if (data.url) {
            window.open(data.url, '_top');
        } else {
            alert('Could not get authentication URL. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-base-100 p-4">
             <div className="absolute inset-0 z-0 opacity-20">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-base-100"></div>
            </div>
            <div className="card glass w-full max-w-md shadow-2xl z-10">
                <div className="card-body">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold">{isSignUp ? 'Create an Account' : 'ALL EYE'}</h1>
                        <p className="text-base-content/70 mt-2">
                            {isSignUp ? 'Get started with your new account.' : 'Sign in to continue.'}
                        </p>
                    </div>
                    
                    <form onSubmit={handleAuthAction} className="space-y-4">
                         {isSignUp && (
                            <label className="input input-bordered flex items-center gap-2">
                                <UserIcon className="w-4 h-4 opacity-70" />
                                <input
                                    type="text"
                                    autoComplete="name"
                                    required
                                    disabled={loading}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="grow"
                                    placeholder="Full Name"
                                />
                            </label>
                         )}
                         <label className="input input-bordered flex items-center gap-2">
                            <MailIcon className="w-4 h-4 opacity-70" />
                            <input
                                type="email"
                                autoComplete="email"
                                required
                                disabled={loading}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="grow"
                                placeholder="Email Address"
                            />
                        </label>
                        <label className="input input-bordered flex items-center gap-2">
                             <LockIcon className="w-4 h-4 opacity-70" />
                            <input
                                type="password"
                                autoComplete="current-password"
                                required
                                disabled={loading}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="grow"
                                placeholder="Password"
                            />
                            {!isSignUp && (
                                <div className="text-sm">
                                    <a href="#" className="link link-primary">Forgot?</a>
                                </div>
                            )}
                        </label>
                        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                            {loading ? <span className="loading loading-spinner"></span> : (isSignUp ? 'Sign Up' : 'Sign In')}
                        </Button>
                    </form>
                    
                    <div className="text-sm text-center mt-4">
                        <button onClick={() => setIsSignUp(!isSignUp)} className="link link-primary">
                            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                        </button>
                    </div>

                    <div className="divider text-xs">Or continue with</div>
                    
                    <div className="space-y-3">
                        <button onClick={() => handleAuthProviderClick('google')} disabled={loading} className="btn btn-ghost w-full">
                            <GoogleIcon />
                            Google Workspace
                        </button>
                        <button onClick={() => handleAuthProviderClick('azure')} disabled={loading} className="btn btn-ghost w-full">
                            <AzureIcon />
                            Azure AD
                        </button>
                        <button onClick={() => handleAuthProviderClick('okta')} disabled={loading} className="btn btn-ghost w-full">
                            <OktaIcon />
                            Okta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;

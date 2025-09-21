import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ 
  isOpen, 
  onClose, 
  onBackToLogin 
}) => {
  const { resetPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleBackToLogin = () => {
    setEmailSent(false);
    setEmail('');
    onBackToLogin();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              {emailSent ? 'Check Your Email' : 'Reset Password'}
            </CardTitle>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>
          {!emailSent && (
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {emailSent ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Email Sent Successfully!</h3>
                <p className="text-sm text-muted-foreground">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Check your inbox and click the link to reset your password. 
                  Don't forget to check your spam folder.
                </p>
              </div>
              
              <div className="space-y-3 pt-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                >
                  Try Different Email
                </Button>
                
                <Button 
                  className="w-full"
                  onClick={handleBackToLogin}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email address"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
              
              <Button 
                type="button"
                variant="ghost" 
                className="w-full"
                onClick={handleBackToLogin}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordModal;
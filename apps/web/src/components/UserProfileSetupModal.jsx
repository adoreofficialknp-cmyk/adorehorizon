
import React, { useState, useContext } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthContext } from '@/contexts/AuthContext';
import api from '@/lib/api.js';
import { toast } from 'sonner';

const UserProfileSetupModal = ({ open, onOpenChange, onSuccess }) => {
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email?.includes('@adore.local') ? '' : (currentUser?.email || ''),
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Full name is required');
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        name: formData.name,
        profileSetupComplete: true
      };
      
      if (formData.email && currentUser?.email?.includes('@adore.local')) {
        updateData.email = formData.email;
      }

      const updatedUser = await api.put('/auth/' + currentUser.id, updateData);
      setCurrentUser(updatedUser);
      toast.success('Profile updated successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      const updatedUser = await api.put('/auth/' + currentUser.id, {
        profileSetupComplete: true
      });
      setCurrentUser(updatedUser);
      onSuccess();
    } catch (error) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background border-border rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif font-bold text-foreground">Complete Your Profile</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Tell us a bit more about yourself to personalize your ADORE experience.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="h-12 rounded-lg border-border focus-visible:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address (Optional)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="h-12 rounded-lg border-border focus-visible:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-secondary transition-colors rounded-lg font-medium"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={handleSkip}
              className="w-full h-12 text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileSetupModal;

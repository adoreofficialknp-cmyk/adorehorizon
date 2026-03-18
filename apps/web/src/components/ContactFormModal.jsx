
import React, { useState, useContext } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { AuthContext } from '@/contexts/AuthContext';
import { Loader2, Paperclip, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const ContactFormModal = ({ isOpen, onClose }) => {
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  const { createTicket, loading } = useSupportTickets();
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    priority: 'Medium',
    message: ''
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 20 * 1024 * 1024) {
        toast.error('File size must be less than 20MB');
        e.target.value = null;
        return;
      }
      setFile(selectedFile);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      toast.error('Please log in to submit a support ticket');
      return;
    }
    
    if (!validate()) return;

    try {
      await createTicket(
        currentUser.id,
        formData.subject,
        formData.message,
        formData.category,
        formData.priority,
        file
      );
      setIsSuccess(true);
    } catch (error) {
      // Error handled in hook
    }
  };

  const resetAndClose = () => {
    setFormData({ subject: '', category: '', priority: 'Medium', message: '' });
    setFile(null);
    setErrors({});
    setIsSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="sm:max-w-[550px]">
        {isSuccess ? (
          <div className="py-12 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-2">Message Sent!</h2>
            <p className="text-muted-foreground mb-8 max-w-[80%]">
              We've received your message and created a support ticket. Our team will get back to you shortly.
            </p>
            <Button onClick={resetAndClose} className="min-w-[150px]">Done</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Contact Support</DialogTitle>
              <DialogDescription>
                Fill out the form below and we'll get back to you as soon as possible.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject <span className="text-destructive">*</span></Label>
                <Input 
                  id="subject" 
                  placeholder="Brief description of your issue"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className={errors.subject ? 'border-destructive' : ''}
                />
                {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category <span className="text-destructive">*</span></Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                    <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General Inquiry</SelectItem>
                      <SelectItem value="Order">Order Issue</SelectItem>
                      <SelectItem value="Product">Product Question</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message <span className="text-destructive">*</span></Label>
                <Textarea 
                  id="message" 
                  placeholder="Please provide as much detail as possible..."
                  className={`min-h-[120px] resize-y ${errors.message ? 'border-destructive' : ''}`}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value.slice(0, 1000)})}
                />
                <div className="flex justify-between items-center">
                  {errors.message ? (
                    <p className="text-xs text-destructive">{errors.message}</p>
                  ) : (
                    <span />
                  )}
                  <p className="text-xs text-muted-foreground">{formData.message.length}/1000</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachment" className="cursor-pointer flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors w-fit">
                  <Paperclip className="w-4 h-4" /> 
                  {file ? file.name : 'Attach a file (optional)'}
                </Label>
                <Input 
                  id="attachment" 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                />
                <p className="text-xs text-muted-foreground">Max size: 20MB. Supported formats: Images, PDF, Word.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={resetAndClose} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="min-w-[120px]">
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : 'Send Message'}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContactFormModal;

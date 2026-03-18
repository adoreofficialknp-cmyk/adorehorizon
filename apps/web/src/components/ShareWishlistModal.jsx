
import React, { useState, useEffect } from 'react';
import { Copy, Mail, Share2, CheckCircle2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useWishlist } from '@/hooks/useWishlist';

const ShareWishlistModal = ({ isOpen, onClose, itemCount, totalValue }) => {
  const { shareWishlist } = useWishlist();
  const [shareLink, setShareLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (isOpen) {
      generateLink();
    } else {
      setCopied(false);
      setEmail('');
    }
  }, [isOpen]);

  const generateLink = async () => {
    setLoading(true);
    const token = await shareWishlist();
    if (token) {
      setShareLink(`${window.location.origin}/shared-wishlist/${token}`);
    } else {
      onClose();
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailShare = (e) => {
    e.preventDefault();
    if (!email || !shareLink) return;
    
    const subject = encodeURIComponent("Check out my ADORE Jewellery Wishlist!");
    const body = encodeURIComponent(`I've saved some beautiful pieces on ADORE Jewellery. Check them out here:\n\n${shareLink}`);
    
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    toast.success('Opened email client');
    setEmail('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" /> Share Wishlist
          </DialogTitle>
          <DialogDescription>
            Share your favorite pieces with friends and family.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Generating share link...</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Wishlist Summary</p>
                <p className="text-xs text-muted-foreground mt-1">{itemCount} items</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">Total Value</p>
                <p className="text-sm font-bold text-primary mt-1">₹{totalValue.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input 
                  readOnly 
                  value={shareLink} 
                  className="bg-muted/50 font-mono text-xs"
                />
                <Button 
                  variant={copied ? "default" : "outline"} 
                  className={copied ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                  onClick={handleCopy}
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or share via email</span>
              </div>
            </div>

            <form onSubmit={handleEmailShare} className="space-y-2">
              <Label htmlFor="share-email">Email Address</Label>
              <div className="flex gap-2">
                <Input 
                  id="share-email"
                  type="email" 
                  placeholder="friend@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  <Mail className="w-4 h-4 mr-2" /> Send
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareWishlistModal;

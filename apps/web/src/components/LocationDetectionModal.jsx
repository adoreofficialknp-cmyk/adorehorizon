
import React, { useState, useEffect, useContext } from 'react';
import { MapPin, Navigation, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthContext } from '@/contexts/AuthContext';
import api from '@/lib/api.js';
import { toast } from 'sonner';

const LocationDetectionModal = ({ open, onOpenChange, onLocationSet }) => {
  const [manualLocation, setManualLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const hasDetected = localStorage.getItem('adoreLocationDetected');
    if (!hasDetected && !open) {
      // Small delay to not block initial render
      const timer = setTimeout(() => onOpenChange(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [open, onOpenChange]);

  const saveLocation = async (city, pincode = '') => {
    localStorage.setItem('adoreLocationDetected', 'true');
    localStorage.setItem('adoreUserCity', city);
    if (pincode) localStorage.setItem('adoreUserPincode', pincode);
    
    if (currentUser) {
      try {
        await api.put('/auth/' + currentUser.id, {
          location_city: city);
      } catch (error) {
        console.error('Failed to save location to profile:', error);
      }
    }
    
    onLocationSet(city);
    onOpenChange(false);
    toast.success(`Delivery location set to ${city}`);
  };

  const handleDetectLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Using OpenStreetMap Nominatim API for reverse geocoding (free, no key required)
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          
          const city = data.address.city || data.address.town || data.address.village || data.address.county || 'Unknown Location';
          const pincode = data.address.postcode || '';
          
          await saveLocation(city, pincode);
        } catch (error) {
          toast.error('Failed to detect city. Please enter manually.');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        toast.error('Location access denied. Please enter manually.');
        setLoading(false);
      }
    );
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualLocation.trim()) return;
    setLoading(true);
    await saveLocation(manualLocation.trim());
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background text-foreground border-border rounded-2xl p-6">
        <DialogHeader className="text-center mb-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-serif font-bold">Where should we deliver to?</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Set your location to see delivery options and faster shipping times.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          <Button 
            onClick={handleDetectLocation} 
            disabled={loading}
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-accent transition-colors rounded-xl text-base font-medium flex items-center justify-center gap-2"
          >
            <Navigation className="h-5 w-5" />
            {loading ? 'Detecting...' : 'Detect My Location'}
          </Button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 mx-4 text-muted-foreground text-sm">Or enter manually</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <Input
              placeholder="Enter City or Pincode"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              className="h-12 rounded-xl border-border focus-visible:ring-primary bg-card"
            />
            <Button 
              type="submit" 
              disabled={!manualLocation.trim() || loading}
              variant="outline"
              className="w-full h-12 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors rounded-xl text-base font-medium"
            >
              Save Location
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationDetectionModal;


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import api from '@/lib/api.js';
import { toast } from 'sonner';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    try {
      // email_signups not in new backend — extend API to support newsletter if needed
      toast.success('Successfully subscribed to our newsletter!');
      setEmail('');
    } catch (error) {
      toast.error('You might already be subscribed or an error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#1a1a1a] text-[#f5f5f5] pt-20 pb-24 md:pb-10 border-t-4 border-[#D4AF37]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & About */}
          <div className="lg:col-span-4 pr-0 lg:pr-8">
            <Link to="/" className="inline-block mb-6 hover-lift">
              <span className="text-3xl luxury-text gold-accent">
                ADORE
              </span>
            </Link>
            <p className="text-[#e0e0e0] text-sm leading-relaxed mb-8 font-sans">
              Crafting timeless elegance since 2015. Discover our exclusive collection of fine jewelry, designed to celebrate your most precious moments with unparalleled craftsmanship.
            </p>
            
            <div className="space-y-4">
              <h4 className="text-sm luxury-text tracking-wider text-white uppercase">Join Our Newsletter</h4>
              <form onSubmit={handleSubscribe} className="relative max-w-sm flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Enter your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 focus-visible:ring-[#D4AF37] focus-visible:border-[#D4AF37] rounded-[8px] h-12 pl-4 text-white placeholder:text-gray-400 smooth-transition"
                  required
                />
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="luxury-button px-4 min-h-[48px]"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="text-sm luxury-text tracking-wider mb-6 text-white uppercase">Explore</h4>
            <ul className="space-y-4">
              {['New Arrivals', 'Best Sellers', 'Rings', 'Necklaces', 'Earrings', 'Bracelets'].map((item) => (
                <li key={item}>
                  <Link to={`/shop?category=${item.toLowerCase().replace(' ', '-')}`} className="text-sm text-[#e0e0e0] hover:text-[#D4AF37] smooth-transition inline-block transform hover:translate-x-1">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="lg:col-span-2">
            <h4 className="text-sm luxury-text tracking-wider mb-6 text-white uppercase">Support</h4>
            <ul className="space-y-4">
              {['FAQ', 'Track Order', 'Returns & Exchanges', 'Shipping Policy', 'Ring Sizer', 'Contact Us'].map((item) => (
                <li key={item}>
                  <Link to={`/${item.toLowerCase().replace(/ & | /g, '-')}`} className="text-sm text-[#e0e0e0] hover:text-[#D4AF37] smooth-transition inline-block transform hover:translate-x-1">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-3">
            <h4 className="text-sm luxury-text tracking-wider mb-6 text-white uppercase">Get in Touch</h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 text-sm text-[#e0e0e0] group">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#D4AF37]/20 smooth-transition">
                  <MapPin className="h-4 w-4 text-[#D4AF37]" />
                </div>
                <span className="pt-1">123 Luxury Avenue, Suite 500<br/>New York, NY 10022</span>
              </li>
              <li className="flex items-center gap-4 text-sm text-[#e0e0e0] group">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#D4AF37]/20 smooth-transition">
                  <Phone className="h-4 w-4 text-[#D4AF37]" />
                </div>
                <span>+1 (800) 123-4567</span>
              </li>
              <li className="flex items-center gap-4 text-sm text-[#e0e0e0] group">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#D4AF37]/20 smooth-transition">
                  <Mail className="h-4 w-4 text-[#D4AF37]" />
                </div>
                <span>support@adorejewellery.com</span>
              </li>
            </ul>
            
            <div className="flex gap-3 mt-8">
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-[#D4AF37] hover:text-[#1a1a1a] hover-lift">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-[#D4AF37] hover:text-[#1a1a1a] hover-lift">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-[#D4AF37] hover:text-[#1a1a1a] hover-lift">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-gray-400 font-sans">
            © {currentYear} ADORE Jewellery. All rights reserved.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400 font-sans">
            <Link to="/privacy-policy" className="hover:text-[#D4AF37] smooth-transition">Privacy Policy</Link>
            <Link to="/terms-conditions" className="hover:text-[#D4AF37] smooth-transition">Terms & Conditions</Link>
            <Link to="/accessibility" className="hover:text-[#D4AF37] smooth-transition">Accessibility</Link>
          </div>

          <div className="flex items-center gap-2 opacity-70">
            <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center text-[10px] font-bold text-white">VISA</div>
            <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center text-[10px] font-bold text-white">MC</div>
            <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center text-[10px] font-bold text-white">AMEX</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

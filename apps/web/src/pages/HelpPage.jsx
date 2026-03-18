
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Search, ThumbsUp, MessageSquare, Mail, Phone } from 'lucide-react';
import api from '@/lib/api.js';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactFormModal from '@/components/ContactFormModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const HelpPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [votedFaqs, setVotedFaqs] = useState(new Set());

  const categories = ['All', 'Shipping', 'Returns', 'Payments', 'Products', 'Account', 'Other'];

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const records = []; // FAQs collection not in new backend
        setFaqs(records);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        toast.error('Failed to load FAQs');
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const handleHelpfulVote = async (e, id, currentCount) => {
    e.stopPropagation();
    if (votedFaqs.has(id)) return;

    try {
      // helpful_count tracking not available in this backend version
      
      setVotedFaqs(new Set([...votedFaqs, id]));
      setFaqs(faqs.map(faq => faq.id === id ? { ...faq, helpful_count: currentCount + 1 } : faq));
      toast.success('Thanks for your feedback!');
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Help Center & FAQs - ADORE Jewellery</title>
        <meta name="description" content="Find answers to common questions about shipping, returns, and our jewelry. Contact our support team for assistance." />
      </Helmet>
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-[#1A1A1A] text-white py-20 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">How can we help you?</h1>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-6 rounded-full text-lg text-foreground bg-white border-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 -mt-24 relative z-10">
            <div className="bg-card p-6 rounded-2xl border border-border text-center shadow-lg hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Call Us</h3>
              <p className="text-muted-foreground text-sm mb-2">Mon-Fri, 9am-6pm EST</p>
              <p className="font-medium">+1 (800) 123-4567</p>
            </div>
            
            <div className="bg-card p-6 rounded-2xl border border-border text-center shadow-lg hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Email Us</h3>
              <p className="text-muted-foreground text-sm mb-2">We'll reply within 24 hours</p>
              <p className="font-medium">support@adorejewellery.com</p>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border text-center shadow-lg hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-center">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Support Ticket</h3>
              <p className="text-muted-foreground text-sm mb-4">Submit a detailed request</p>
              <Button onClick={() => setIsContactModalOpen(true)} variant="outline" size="sm" className="mx-auto">
                Contact Support
              </Button>
            </div>
          </div>

          {/* FAQs Section */}
          <div className="space-y-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-serif font-bold text-foreground">Frequently Asked Questions</h2>
            </div>

            <Tabs defaultValue="All" value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <TabsList className="w-full flex flex-wrap h-auto bg-transparent justify-center gap-2 mb-8">
                {categories.map(cat => (
                  <TabsTrigger 
                    key={cat} 
                    value={cat}
                    className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-border data-[state=active]:border-primary"
                  >
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                  </div>
                ) : filteredFaqs.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No questions found</h3>
                    <p className="text-muted-foreground mb-6">We couldn't find any FAQs matching your search.</p>
                    <Button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} variant="outline">
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {filteredFaqs.map((faq) => (
                      <AccordionItem key={faq.id} value={faq.id} className="border border-border rounded-xl px-6 bg-background overflow-hidden">
                        <AccordionTrigger className="text-left font-medium hover:no-underline py-5 text-base">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed pb-5 pt-2 border-t border-border/50">
                          <div className="prose max-w-none text-sm md:text-base mb-6">
                            {faq.answer}
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-border/30">
                            <span className="text-xs text-muted-foreground">Was this helpful?</span>
                            <button 
                              onClick={(e) => handleHelpfulVote(e, faq.id, faq.helpful_count || 0)}
                              disabled={votedFaqs.has(faq.id)}
                              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                                votedFaqs.has(faq.id) 
                                  ? 'bg-primary/10 text-primary' 
                                  : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              <ThumbsUp className={`w-3.5 h-3.5 ${votedFaqs.has(faq.id) ? 'fill-primary' : ''}`} />
                              {faq.helpful_count || 0}
                            </button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </Tabs>
          </div>

          {/* Still need help */}
          <div className="mt-20 text-center bg-muted/30 rounded-3xl p-10 border border-border">
            <h2 className="text-2xl font-serif font-bold mb-4">Still have questions?</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Can't find the answer you're looking for? Please chat to our friendly team.
            </p>
            <Button size="lg" onClick={() => setIsContactModalOpen(true)} className="rounded-full px-8">
              Get in Touch
            </Button>
          </div>

        </div>
      </main>
      
      <Footer />
      <ContactFormModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
    </div>
  );
};

export default HelpPage;

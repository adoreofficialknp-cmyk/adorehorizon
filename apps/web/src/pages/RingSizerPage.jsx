
import React, { useState } from 'react';
import { Download, Share2, Ruler, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

const ringSizes = [
  { us: '4', uk: 'H', eu: '46.5', in: '6', mm: 14.8 },
  { us: '4.5', uk: 'I', eu: '47.8', in: '8', mm: 15.3 },
  { us: '5', uk: 'J 1/2', eu: '49', in: '9', mm: 15.7 },
  { us: '5.5', uk: 'L', eu: '50.3', in: '11', mm: 16.1 },
  { us: '6', uk: 'M', eu: '51.5', in: '12', mm: 16.5 },
  { us: '6.5', uk: 'N', eu: '52.8', in: '13', mm: 16.9 },
  { us: '7', uk: 'O', eu: '54', in: '14', mm: 17.3 },
  { us: '7.5', uk: 'P', eu: '55.3', in: '16', mm: 17.7 },
  { us: '8', uk: 'Q', eu: '56.6', in: '17', mm: 18.1 },
  { us: '8.5', uk: 'Q 1/2', eu: '57.8', in: '18', mm: 18.5 },
  { us: '9', uk: 'R 1/2', eu: '59.1', in: '19', mm: 18.9 },
  { us: '9.5', uk: 'S 1/2', eu: '60.3', in: '21', mm: 19.4 },
  { us: '10', uk: 'T 1/2', eu: '61.6', in: '22', mm: 19.8 },
];

const RingSizerPage = () => {
  const [measurement, setMeasurement] = useState('');
  const [calculatedSize, setCalculatedSize] = useState(null);

  const handleCalculate = () => {
    const mm = parseFloat(measurement);
    if (isNaN(mm) || mm < 13 || mm > 25) {
      toast.error('Please enter a valid measurement between 13mm and 25mm');
      return;
    }
    
    const closest = ringSizes.reduce((prev, curr) => 
      Math.abs(curr.mm - mm) < Math.abs(prev.mm - mm) ? curr : prev
    );
    setCalculatedSize(closest);
  };

  const downloadPDF = async () => {
    toast.info('Generating PDF...');
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('ADORE Ring Sizer Guide', 20, 20);
    doc.setFontSize(12);
    doc.text('1. Print this page at 100% scale (do not scale to fit).', 20, 35);
    doc.text('2. Cut out the sizer below.', 20, 45);
    doc.text('3. Wrap it around your finger and read the size.', 20, 55);
    
    // Draw a simple ruler representation
    doc.rect(20, 70, 150, 15);
    for(let i=0; i<=15; i++) {
      doc.line(20 + (i*10), 70, 20 + (i*10), 75);
      doc.text(i.toString(), 19 + (i*10), 83);
    }
    doc.text('cm', 175, 83);
    
    doc.save('ADORE_Ring_Sizer.pdf');
    toast.success('PDF downloaded successfully');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold mb-4">Find Your Perfect Fit</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Use our comprehensive guide to determine your exact ring size from the comfort of your home.
          </p>
        </div>

        <Tabs defaultValue="measure" className="w-full mb-16">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="measure">Measure Online</TabsTrigger>
            <TabsTrigger value="chart">Size Chart</TabsTrigger>
            <TabsTrigger value="print">Printable Sizer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="measure">
            <Card className="border-none shadow-lg bg-card">
              <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-6">
                  <h3 className="text-2xl font-serif font-semibold">Measure Your Finger</h3>
                  <p className="text-muted-foreground">
                    Wrap a piece of string or paper around the base of your finger. Mark where the ends meet and measure the length in millimeters (mm).
                  </p>
                  <div className="flex gap-4">
                    <Input 
                      type="number" 
                      placeholder="Enter mm (e.g. 16.5)" 
                      value={measurement}
                      onChange={(e) => setMeasurement(e.target.value)}
                      className="max-w-[200px]"
                    />
                    <Button onClick={handleCalculate} className="bg-primary hover:bg-primary/90">Calculate Size</Button>
                  </div>
                  
                  {calculatedSize && (
                    <div className="p-6 bg-muted/30 rounded-xl border border-border mt-6 animate-in fade-in slide-in-from-bottom-4">
                      <h4 className="text-lg font-medium mb-4">Your Recommended Size:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-3 bg-background rounded-lg shadow-sm">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">India</p>
                          <p className="text-2xl font-bold text-primary">{calculatedSize.in}</p>
                        </div>
                        <div className="p-3 bg-background rounded-lg shadow-sm">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">US</p>
                          <p className="text-2xl font-bold">{calculatedSize.us}</p>
                        </div>
                        <div className="p-3 bg-background rounded-lg shadow-sm">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">UK</p>
                          <p className="text-2xl font-bold">{calculatedSize.uk}</p>
                        </div>
                        <div className="p-3 bg-background rounded-lg shadow-sm">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">EU</p>
                          <p className="text-2xl font-bold">{calculatedSize.eu}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="w-64 h-64 bg-muted rounded-full flex items-center justify-center border-8 border-primary/20 relative">
                    <Ruler className="w-16 h-16 text-primary/40" />
                    {calculatedSize && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div 
                          className="rounded-full border-2 border-primary transition-all duration-500"
                          style={{ width: `${calculatedSize.mm * 8}px`, height: `${calculatedSize.mm * 8}px` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chart">
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                    <tr>
                      <th className="px-6 py-4">Diameter (mm)</th>
                      <th className="px-6 py-4">India</th>
                      <th className="px-6 py-4">US / Canada</th>
                      <th className="px-6 py-4">UK / Australia</th>
                      <th className="px-6 py-4">Europe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ringSizes.map((size, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-medium">{size.mm}</td>
                        <td className="px-6 py-4 font-bold text-primary">{size.in}</td>
                        <td className="px-6 py-4">{size.us}</td>
                        <td className="px-6 py-4">{size.uk}</td>
                        <td className="px-6 py-4">{size.eu}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="print">
            <Card className="border-none shadow-lg text-center p-12">
              <Ruler className="w-16 h-16 mx-auto text-primary mb-6" />
              <h3 className="text-2xl font-serif font-semibold mb-4">Printable Ring Sizer</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                Download our printable PDF guide. Ensure your printer is set to 100% scale for accurate measurements.
              </p>
              <Button onClick={downloadPDF} size="lg" className="bg-primary hover:bg-primary/90">
                <Download className="w-5 h-5 mr-2" /> Download PDF Guide
              </Button>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
          <div>
            <h3 className="text-2xl font-serif font-semibold mb-6">Video Tutorial</h3>
            <div className="aspect-video rounded-xl overflow-hidden bg-muted relative group">
              <img src="https://images.unsplash.com/photo-1605100804763-247f66126e9e?auto=format&fit=crop&q=80&w=800" alt="Tutorial thumbnail" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg">
                  <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[16px] border-l-primary border-b-8 border-b-transparent ml-1"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-serif font-semibold mb-6">Frequently Asked Questions</h3>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>When is the best time to measure?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Fingers tend to swell throughout the day. It's best to measure your finger at the end of the day when it is at its largest.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>What if I'm between sizes?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  If your measurement falls between two sizes, we always recommend choosing the larger size for comfort.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Does ring width affect size?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, wider bands (over 5mm) fit tighter than narrow bands. You may need to go up half a size for a wide band.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RingSizerPage;

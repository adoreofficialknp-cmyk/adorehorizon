
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Smartphone, Code, Send, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// Dummy template generator for preview purposes
const generateDummyTemplate = (type, data) => {
  const primaryColor = '#D4AF37';
  const bgColor = '#f9fafb';
  const textColor = '#1f2937';
  
  const header = `
    <div style="background-color: #1a1a1a; padding: 30px 20px; text-align: center;">
      <h1 style="color: ${primaryColor}; margin: 0; font-family: 'Playfair Display', serif; font-size: 28px; letter-spacing: 2px;">ADORE</h1>
      <p style="color: #ffffff; margin: 5px 0 0 0; font-family: sans-serif; font-size: 12px; letter-spacing: 1px;">FINE JEWELLERY</p>
    </div>
  `;

  const footer = `
    <div style="background-color: #f3f4f6; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb; margin-top: 40px;">
      <p style="color: #6b7280; font-family: sans-serif; font-size: 12px; margin: 0 0 10px 0;">
        Need help? Contact us at <a href="mailto:support@adorejewellery.com" style="color: ${primaryColor}; text-decoration: none;">support@adorejewellery.com</a>
      </p>
      <p style="color: #9ca3af; font-family: sans-serif; font-size: 12px; margin: 0;">
        &copy; ${new Date().getFullYear()} ADORE Jewellery. All rights reserved.
      </p>
    </div>
  `;

  let content = '';

  switch (type) {
    case 'order_confirmation':
      content = `
        <h2 style="color: ${textColor}; font-family: 'Playfair Display', serif; font-size: 24px; margin-bottom: 20px;">Thank you for your order, ${data.customerName}!</h2>
        <p style="color: #4b5563; font-family: sans-serif; line-height: 1.6;">We've received your order <strong>#${data.orderId}</strong> and are getting it ready for shipment.</p>
        
        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 30px 0;">
          <h3 style="margin-top: 0; font-family: sans-serif; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Order Summary</h3>
          <table style="width: 100%; font-family: sans-serif; font-size: 14px; color: #4b5563;">
            <tr>
              <td style="padding: 10px 0;">1x Classic Gold Ring</td>
              <td style="padding: 10px 0; text-align: right;">₹15,000</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-top: 1px solid #e5e7eb;"><strong>Total</strong></td>
              <td style="padding: 10px 0; border-top: 1px solid #e5e7eb; text-align: right;"><strong>₹15,000</strong></td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="#" style="background-color: ${primaryColor}; color: #1a1a1a; padding: 14px 30px; text-decoration: none; font-family: sans-serif; font-weight: bold; border-radius: 4px; display: inline-block;">Track Your Order</a>
        </div>
      `;
      break;
    case 'shipping_notification':
      content = `
        <h2 style="color: ${textColor}; font-family: 'Playfair Display', serif; font-size: 24px; margin-bottom: 20px;">Your order is on its way!</h2>
        <p style="color: #4b5563; font-family: sans-serif; line-height: 1.6;">Great news, ${data.customerName}! Your order <strong>#${data.orderId}</strong> has been shipped via ${data.courierName}.</p>
        
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
          <p style="margin: 0; color: #166534; font-family: sans-serif; font-size: 14px;">Tracking Number</p>
          <p style="margin: 5px 0 0 0; color: #15803d; font-family: monospace; font-size: 20px; font-weight: bold; letter-spacing: 2px;">${data.trackingNumber}</p>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="#" style="background-color: ${primaryColor}; color: #1a1a1a; padding: 14px 30px; text-decoration: none; font-family: sans-serif; font-weight: bold; border-radius: 4px; display: inline-block;">Track Shipment</a>
        </div>
      `;
      break;
    default:
      content = `<p style="font-family: sans-serif;">Select a template type to preview.</p>`;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Preview</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: ${bgColor};">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        ${header}
        <div style="padding: 40px 30px;">
          ${content}
        </div>
        ${footer}
      </div>
    </body>
    </html>
  `;
};

const AdminEmailTemplatePreviewPage = () => {
  const [templateType, setTemplateType] = useState('order_confirmation');
  const [viewMode, setViewMode] = useState('desktop');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: 'Jane Doe',
    orderId: 'ORD-847291',
    trackingNumber: 'AWB987654321',
    courierName: 'BlueDart'
  });

  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    generatePreview();
  }, [templateType, formData]);

  const generatePreview = () => {
    setIsGenerating(true);
    // Simulate network delay
    setTimeout(() => {
      const html = generateDummyTemplate(templateType, formData);
      setHtmlContent(html);
      setIsGenerating(false);
    }, 300);
  };

  const handleSendTest = () => {
    toast.success('Test email sent successfully to admin address');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <Helmet><title>Email Templates - Admin</title></Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1A1A1A]">Email Templates</h1>
          <p className="text-muted-foreground mt-1">Preview and test system email notifications</p>
        </div>
        <Button onClick={handleSendTest} className="bg-[#1A1A1A] hover:bg-[#333333] text-white">
          <Send className="w-4 h-4 mr-2" /> Send Test Email
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Template Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Template Type</Label>
                <Select value={templateType} onValueChange={setTemplateType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order_confirmation">Order Confirmation</SelectItem>
                    <SelectItem value="payment_confirmation">Payment Confirmation</SelectItem>
                    <SelectItem value="shipping_notification">Shipping Notification</SelectItem>
                    <SelectItem value="delivery_confirmation">Delivery Confirmation</SelectItem>
                    <SelectItem value="admin_new_order">Admin New Order Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Sample Data</CardTitle>
              <CardDescription>Variables used to populate the preview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input 
                  value={formData.customerName} 
                  onChange={e => setFormData({...formData, customerName: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Order ID</Label>
                <Input 
                  value={formData.orderId} 
                  onChange={e => setFormData({...formData, orderId: e.target.value})} 
                />
              </div>
              
              {templateType === 'shipping_notification' && (
                <>
                  <div className="space-y-2">
                    <Label>Tracking Number</Label>
                    <Input 
                      value={formData.trackingNumber} 
                      onChange={e => setFormData({...formData, trackingNumber: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Courier Name</Label>
                    <Input 
                      value={formData.courierName} 
                      onChange={e => setFormData({...formData, courierName: e.target.value})} 
                    />
                  </div>
                </>
              )}
              
              <Button variant="outline" className="w-full mt-2" onClick={generatePreview}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                Update Preview
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-8">
          <Card className="border-none shadow-sm h-full flex flex-col">
            <CardHeader className="border-b pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-serif">Live Preview</CardTitle>
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`h-8 px-3 ${viewMode === 'desktop' ? 'bg-white shadow-sm' : ''}`}
                  onClick={() => setViewMode('desktop')}
                >
                  <Monitor className="w-4 h-4 mr-2" /> Desktop
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`h-8 px-3 ${viewMode === 'mobile' ? 'bg-white shadow-sm' : ''}`}
                  onClick={() => setViewMode('mobile')}
                >
                  <Smartphone className="w-4 h-4 mr-2" /> Mobile
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 bg-muted/30 flex flex-col">
              <Tabs defaultValue="preview" className="w-full h-full flex flex-col">
                <div className="px-6 pt-4">
                  <TabsList>
                    <TabsTrigger value="preview">Visual Preview</TabsTrigger>
                    <TabsTrigger value="code"><Code className="w-4 h-4 mr-2" /> HTML Source</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="preview" className="flex-1 p-6 flex justify-center m-0">
                  <div 
                    className={`bg-white border border-border shadow-sm transition-all duration-300 overflow-hidden ${
                      viewMode === 'mobile' ? 'w-[375px] h-[667px] rounded-[2rem] border-8 border-gray-800' : 'w-full h-[600px] rounded-lg'
                    }`}
                  >
                    <iframe 
                      srcDoc={htmlContent} 
                      className="w-full h-full border-none"
                      title="Email Preview"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="code" className="flex-1 p-6 m-0">
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg h-[600px] overflow-auto font-mono text-sm whitespace-pre-wrap">
                    {htmlContent}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminEmailTemplatePreviewPage;

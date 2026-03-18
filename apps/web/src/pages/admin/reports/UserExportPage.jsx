
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import api from '@/lib/api.js';
import { exportToCSV, exportToExcel, exportToPDF } from '@/utils/exportUtils';
import { toast } from 'sonner';

const UserExportPage = () => {
  const [exporting, setExporting] = useState(false);
  const [fields, setFields] = useState({
    id: true,
    name: true,
    email: true,
    phone: true,
    address: false,
    city: false,
    pincode: false,
    created: true,
    role: true
  });

  const handleFieldChange = (field) => {
    setFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleExport = async (format) => {
    setExporting(true);
    const loadingToast = toast.loading(`Generating ${format.toUpperCase()} export...`);
    
    try {
      const records = await api.get('/auth/users?limit=1000').then(d => Array.isArray(d) ? d : d.items || []).catch(() => []);

      const dataToExport = records.map(user => {
        const row = {};
        if (fields.id) row['User ID'] = user.id;
        if (fields.name) row['Name'] = user.name || 'N/A';
        if (fields.email) row['Email'] = user.email;
        if (fields.phone) row['Phone'] = user.phone || 'N/A';
        if (fields.address) row['Address'] = user.address || 'N/A';
        if (fields.city) row['City'] = user.city || 'N/A';
        if (fields.pincode) row['Pincode'] = user.pincode || 'N/A';
        if (fields.created) row['Registration Date'] = (user.createdAt||user.created) ? new Date(user.createdAt||user.created).toLocaleDateString() : 'N/A';
        if (fields.role) row['Role'] = user.role || 'customer';
        return row;
      });

      const filename = `users_export_${new Date().toISOString().split('T')[0]}`;

      if (format === 'csv') exportToCSV(dataToExport, filename);
      else if (format === 'excel') exportToExcel(dataToExport, filename);
      else if (format === 'pdf') exportToPDF(dataToExport, filename, 'User Data Export');

      toast.success('Export completed successfully', { id: loadingToast });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data', { id: loadingToast });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Helmet><title>Export Users - Admin</title></Helmet>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">Export User Data</h1>
        <p className="text-muted-foreground">Download customer information for external analysis</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Fields to Export</CardTitle>
          <CardDescription>Choose which data columns to include in your export file.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {Object.keys(fields).map(field => (
              <div key={field} className="flex items-center space-x-2">
                <Checkbox 
                  id={`field-${field}`} 
                  checked={fields[field]} 
                  onCheckedChange={() => handleFieldChange(field)} 
                />
                <Label htmlFor={`field-${field}`} className="capitalize cursor-pointer">
                  {field.replace('_', ' ')}
                </Label>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
            <Button 
              onClick={() => handleExport('csv')} 
              disabled={exporting}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white"
            >
              <FileText className="w-4 h-4 mr-2" /> Export as CSV
            </Button>
            <Button 
              onClick={() => handleExport('excel')} 
              disabled={exporting}
              className="flex-1 bg-green-700 hover:bg-green-600 text-white"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Export as Excel
            </Button>
            <Button 
              onClick={() => handleExport('pdf')} 
              disabled={exporting}
              className="flex-1 bg-red-700 hover:bg-red-600 text-white"
            >
              <Download className="w-4 h-4 mr-2" /> Export as PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserExportPage;

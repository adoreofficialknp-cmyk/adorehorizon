
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, FileSpreadsheet, FileText, FileJson, ArrowLeft, Filter, Loader2, AlertCircle } from 'lucide-react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const UserDataExportPage = () => {
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('all');
  const [ringSizeFilter, setRingSizeFilter] = useState('all');
  const [error, setError] = useState(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch ALL users first to avoid 400 error with boolean field filtering in some PB versions
      const records = await api.get('/auth/users?limit=500').then(d => Array.isArray(d) ? d : d.items || []);

      // 1. Filter out admins in frontend
      let filteredRecords = records.filter(user => user.is_admin !== true);

      // 2. Apply Date Filter
      if (dateRange !== 'all') {
        const date = new Date();
        if (dateRange === '30days') date.setDate(date.getDate() - 30);
        if (dateRange === '90days') date.setDate(date.getDate() - 90);
        if (dateRange === '1year') date.setFullYear(date.getFullYear() - 1);
        
        filteredRecords = filteredRecords.filter(user => new Date(user.createdAt || user.created) >= date);
      }
      
      // 3. Apply Ring Size Filter
      if (ringSizeFilter !== 'all') {
        filteredRecords = filteredRecords.filter(user => user.ring_size === ringSizeFilter);
      }

      if (filteredRecords.length === 0) {
        toast.error('No users found matching the selected filters');
        setLoading(false);
        return;
      }

      const exportData = filteredRecords.map(user => ({
        'User ID': user.id,
        'Name': user.name || 'N/A',
        'Email': user.email || 'N/A',
        'Phone': user.phone || 'N/A',
        'Ring Size': user.ring_size || 'Not Set',
        'Joined Date': new Date(user.createdAt || user.created).toLocaleDateString()
      }));

      const filename = `users_export_${new Date().toISOString().split('T')[0]}`;

      if (format === 'csv') {
        const csv = Papa.unparse(exportData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.csv`;
        link.click();
      } 
      else if (format === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
        XLSX.writeFile(workbook, `${filename}.xlsx`);
      } 
      else if (format === 'pdf') {
        const doc = new jsPDF();
        doc.text("User Data Export", 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22);
        
        const tableColumn = Object.keys(exportData[0]);
        const tableRows = exportData.map(obj => Object.values(obj));
        
        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 30,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [198, 167, 105] }
        });
        doc.save(`${filename}.pdf`);
      } 
      else if (format === 'json') {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${filename}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      }

      toast.success(`Successfully exported ${filteredRecords.length} users`);
    } catch (err) {
      console.error('Export error:', err);
      setError(err.message || 'Failed to fetch and export user data.');
      toast.error('Failed to export user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/admin-portal-secure-access">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1A1A1A]">Export User Data</h1>
          <p className="text-sm text-muted-foreground mt-1">Download customer information for marketing and analysis</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium">Export Failed</h4>
            <p className="text-sm opacity-90 mt-1">{error}</p>
            <Button variant="outline" size="sm" className="mt-2 border-destructive text-destructive hover:bg-destructive/10" onClick={handleExport}>
              Retry Export
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" /> Export Filters
              </CardTitle>
              <CardDescription>Select criteria to filter the users you want to export</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Date Joined</Label>
                  <Select value={dateRange} onValueChange={setDateRange} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="30days">Last 30 Days</SelectItem>
                      <SelectItem value="90days">Last 90 Days</SelectItem>
                      <SelectItem value="1year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Ring Size</Label>
                  <Select value={ringSizeFilter} onValueChange={setRingSizeFilter} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by ring size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sizes</SelectItem>
                      {Array.from({ length: 17 }, (_, i) => i + 4).map(size => (
                        <SelectItem key={size} value={size.toString()}>Size {size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-serif">Export Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div 
                  className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${format === 'csv' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:bg-muted/50'} ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => setFormat('csv')}
                >
                  <FileText className={`w-8 h-8 ${format === 'csv' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="font-medium text-sm">CSV</span>
                </div>
                <div 
                  className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${format === 'excel' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:bg-muted/50'} ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => setFormat('excel')}
                >
                  <FileSpreadsheet className={`w-8 h-8 ${format === 'excel' ? 'text-green-600' : 'text-muted-foreground'}`} />
                  <span className="font-medium text-sm">Excel</span>
                </div>
                <div 
                  className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${format === 'pdf' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:bg-muted/50'} ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => setFormat('pdf')}
                >
                  <FileText className={`w-8 h-8 ${format === 'pdf' ? 'text-red-500' : 'text-muted-foreground'}`} />
                  <span className="font-medium text-sm">PDF</span>
                </div>
                <div 
                  className={`border rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${format === 'json' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:bg-muted/50'} ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                  onClick={() => setFormat('json')}
                >
                  <FileJson className={`w-8 h-8 ${format === 'json' ? 'text-blue-500' : 'text-muted-foreground'}`} />
                  <span className="font-medium text-sm">JSON</span>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button size="lg" onClick={handleExport} disabled={loading} className="w-full sm:w-auto min-w-[200px]">
                  {loading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    <><Download className="w-4 h-4 mr-2" /> Download Data</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-muted/30">
            <CardHeader>
              <CardTitle className="text-base font-serif">Export Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>The exported file will contain the following fields for each user:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>User ID</li>
                <li>Full Name</li>
                <li>Email Address</li>
                <li>Phone Number</li>
                <li>Ring Size</li>
                <li>Registration Date</li>
              </ul>
              <div className="p-3 bg-blue-50 text-blue-800 rounded-lg mt-4 border border-blue-100">
                <p className="font-medium mb-1">Privacy Notice</p>
                <p className="text-xs">Please ensure you handle exported customer data in compliance with your privacy policy and local data protection regulations.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDataExportPage;

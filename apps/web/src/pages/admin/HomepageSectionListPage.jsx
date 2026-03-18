
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, GripVertical } from 'lucide-react';
import api from '@/lib/api.js';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const HomepageSectionListPage = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const result = await api.get('/homepage?limit=500').then(d => Array.isArray(d) ? d : d.items || []);
      setSections(result);
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast.error('Failed to load homepage sections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.put('/homepage/' + id, { active: !currentStatus });
      toast.success(`Section ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchSections();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const moveSection = async (index, direction) => {
    const newSections = [...sections];
    if (direction === 'up' && index > 0) {
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    } else if (direction === 'down' && index < newSections.length - 1) {
      [newSections[index + 1], newSections[index]] = [newSections[index], newSections[index + 1]];
    } else {
      return;
    }

    setSections(newSections);

    try {
      // Update orderIndex for all affected sections
      await Promise.all(newSections.map((sec, idx) => 
        api.put(`/homepage/${sec.id}`, { orderIndex: idx })
      ));
      toast.success('Order updated');
    } catch (error) {
      toast.error('Failed to update order');
      fetchSections(); // Revert on error
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1A1A1A]">Homepage Sections</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and reorder sections on the homepage</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Section Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[40px] rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : sections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No sections found
                  </TableCell>
                </TableRow>
              ) : (
                sections.map((section, index) => (
                  <TableRow key={section.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30">▲</button>
                        <button onClick={() => moveSection(index, 'down')} disabled={index === sections.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30">▼</button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{section.title}</TableCell>
                    <TableCell className="text-muted-foreground capitalize">{section.type?.replace(/_/g, ' ')}</TableCell>
                    <TableCell>
                      <Switch 
                        checked={section.active} 
                        onCheckedChange={() => toggleStatus(section.id, section.active)} 
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                        <Link to={`/admin-portal-secure-access/homepage-sections/${section.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default HomepageSectionListPage;

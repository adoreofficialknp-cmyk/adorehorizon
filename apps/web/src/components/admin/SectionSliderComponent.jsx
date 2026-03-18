
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, GripVertical, Image as ImageIcon } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const SectionSliderComponent = ({ value = {}, onChange }) => {
  const [slides, setSlides] = useState(value.slides || []);
  const [settings, setSettings] = useState({
    autoplay: value.autoplay ?? true,
    autoplay_interval: value.autoplay_interval ?? 5,
    show_arrows: value.show_arrows ?? true,
    show_dots: value.show_dots ?? true,
    ...value
  });

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: settings.autoplay_interval * 1000, stopOnInteraction: false })
  ]);

  useEffect(() => {
    onChange({ ...settings, slides });
  }, [slides, settings]);

  const addSlide = () => {
    setSlides([...slides, { id: Date.now().toString(), image: '', heading: '', description: '', button_text: '', button_link: '' }]);
  };

  const updateSlide = (index, field, val) => {
    const newSlides = [...slides];
    newSlides[index][field] = val;
    setSlides(newSlides);
  };

  const removeSlide = (index) => {
    setSlides(slides.filter((_, i) => i !== index));
  };

  const moveSlide = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === slides.length - 1) return;
    const newSlides = [...slides];
    const target = direction === 'up' ? index - 1 : index + 1;
    [newSlides[index], newSlides[target]] = [newSlides[target], newSlides[index]];
    setSlides(newSlides);
  };

  return (
    <div className="space-y-8">
      {/* Settings */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Slider Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <Label>Autoplay</Label>
            <Switch checked={settings.autoplay} onCheckedChange={(v) => setSettings({...settings, autoplay: v})} />
          </div>
          <div className="space-y-2">
            <Label>Autoplay Interval (seconds)</Label>
            <Input type="number" min="1" value={settings.autoplay_interval} onChange={(e) => setSettings({...settings, autoplay_interval: Number(e.target.value)})} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Show Navigation Arrows</Label>
            <Switch checked={settings.show_arrows} onCheckedChange={(v) => setSettings({...settings, show_arrows: v})} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Show Dot Indicators</Label>
            <Switch checked={settings.show_dots} onCheckedChange={(v) => setSettings({...settings, show_dots: v})} />
          </div>
        </CardContent>
      </Card>

      {/* Slide Management */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Slides ({slides.length})</h3>
          <Button onClick={addSlide} size="sm"><Plus className="w-4 h-4 mr-2" /> Add Slide</Button>
        </div>

        {slides.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-xl text-muted-foreground">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No slides added yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {slides.map((slide, index) => (
              <Card key={slide.id || index} className="border-border shadow-sm">
                <CardContent className="p-4 flex gap-4">
                  <div className="flex flex-col gap-1 shrink-0 justify-center">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveSlide(index, 'up')} disabled={index === 0}>↑</Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveSlide(index, 'down')} disabled={index === slides.length - 1}>↓</Button>
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Image URL</Label>
                      <Input value={slide.image} onChange={(e) => updateSlide(index, 'image', e.target.value)} placeholder="https://..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Heading</Label>
                      <Input value={slide.heading} onChange={(e) => updateSlide(index, 'heading', e.target.value)} placeholder="Slide heading" />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input value={slide.description} onChange={(e) => updateSlide(index, 'description', e.target.value)} placeholder="Slide description" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label>Button Text</Label>
                        <Input value={slide.button_text} onChange={(e) => updateSlide(index, 'button_text', e.target.value)} placeholder="Shop Now" />
                      </div>
                      <div className="space-y-2">
                        <Label>Button Link</Label>
                        <Input value={slide.button_link} onChange={(e) => updateSlide(index, 'button_link', e.target.value)} placeholder="/shop" />
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-start">
                    <Button variant="ghost" size="icon" onClick={() => removeSlide(index)} className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Live Preview */}
      {slides.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Live Preview</h3>
          <div className="border rounded-xl overflow-hidden bg-muted relative h-[300px]">
            <div className="overflow-hidden h-full" ref={emblaRef}>
              <div className="flex h-full">
                {slides.map((slide, idx) => (
                  <div key={idx} className="relative flex-[0_0_100%] min-w-0 h-full">
                    {slide.image ? (
                      <img src={slide.image} alt={slide.heading} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-slate-400">No Image</div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-6">
                      <h2 className="text-3xl font-bold text-white mb-2">{slide.heading || 'Heading'}</h2>
                      <p className="text-white/90 mb-4">{slide.description || 'Description'}</p>
                      {slide.button_text && (
                        <Button className="bg-primary text-primary-foreground">{slide.button_text}</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionSliderComponent;

"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Settings, Upload, History, Download, Volume2, VolumeX, 
  Users, Trophy, Clock, Trash2, FileJson, FileText 
} from 'lucide-react';
import { Participant, Winner, DrawSettings } from '@/lib/types';

interface AdminPanelProps {
  settings: DrawSettings;
  onSettingsChange: (settings: Partial<DrawSettings>) => void;
  participants: Participant[];
  winners: Winner[];
  onImport: (data: Participant[]) => void;
  onExport: (format: 'json' | 'csv') => string;
  onReset: () => void;
  audioSettings: {
    bgmVolume: number;
    sfxVolume: number;
    muted: boolean;
  };
  onBgmVolumeChange: (v: number) => void;
  onSfxVolumeChange: (v: number) => void;
  onToggleMute: () => void;
}

export function AdminPanel({
  settings,
  onSettingsChange,
  participants,
  winners,
  onImport,
  onExport,
  onReset,
  audioSettings,
  onBgmVolumeChange,
  onSfxVolumeChange,
  onToggleMute,
}: AdminPanelProps) {
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');

  const handleImport = () => {
    try {
      setImportError('');
      let data: Participant[];
      
      if (importText.trim().startsWith('[')) {
        data = JSON.parse(importText);
      } else {
        const lines = importText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => {
            obj[h] = values[i] || '';
          });
          return {
            customer_code: obj['customer_code'] || obj['ma_kh'] || '',
            prize_code: obj['prize_code'] || obj['ma_giai'] || '',
            customer_name: obj['customer_name'] || obj['ten_kh'] || '',
          };
        });
      }

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Dữ liệu không hợp lệ');
      }

      const valid = data.every(p => p.customer_code && p.prize_code && p.customer_name);
      if (!valid) {
        throw new Error('Thiếu thông tin bắt buộc');
      }

      onImport(data);
      setImportText('');
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Lỗi không xác định');
    }
  };

  const handleExport = (format: 'json' | 'csv') => {
    const content = onExport(format);
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `winners-${new Date().toISOString().slice(0, 10)}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-4 z-40 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-full w-12 h-12"
        >
          <Settings className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] bg-slate-950/95 border-white/10 backdrop-blur-xl">
        <SheetHeader>
          <SheetTitle className="text-white font-['Orbitron']">Bảng Điều Khiển</SheetTitle>
        </SheetHeader>
        
        <Tabs defaultValue="import" className="mt-6">
          <TabsList className="grid grid-cols-3 bg-white/5">
            <TabsTrigger value="import" className="data-[state=active]:bg-emerald-600">
              <Upload className="w-4 h-4 mr-1" />
              Import
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-emerald-600">
              <History className="w-4 h-4 mr-1" />
              Lịch sử
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-emerald-600">
              <Settings className="w-4 h-4 mr-1" />
              Cài đặt
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="import" className="mt-4 space-y-4">
            <div>
              <Label className="text-white/70">Dán dữ liệu CSV hoặc JSON</Label>
              <Textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`JSON: [{"customer_code":"KH-001","prize_code":"GOLD-001","customer_name":"Nguyen Van A"}]

CSV:
customer_code,prize_code,customer_name
KH-001,GOLD-001,Nguyen Van A`}
                className="mt-2 h-40 bg-white/5 border-white/10 text-white font-mono text-sm"
              />
              {importError && (
                <p className="text-red-400 text-sm mt-2">{importError}</p>
              )}
            </div>
            <Button onClick={handleImport} className="w-full bg-emerald-600 hover:bg-emerald-500">
              <Upload className="w-4 h-4 mr-2" />
              Import Dữ Liệu ({participants.length} người)
            </Button>
            
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-sm text-white/70 mb-2">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Tổng số
                </span>
                <span className="font-bold text-white">{participants.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-white/70 mb-2">
                <span className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Đã trúng
                </span>
                <span className="font-bold text-emerald-400">{winners.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-white/70">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Còn lại
                </span>
                <span className="font-bold text-yellow-400">{participants.length - winners.length}</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="mt-4 space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={() => handleExport('json')} 
                variant="outline" 
                size="sm"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                <FileJson className="w-4 h-4 mr-1" />
                JSON
              </Button>
              <Button 
                onClick={() => handleExport('csv')} 
                variant="outline" 
                size="sm"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                <FileText className="w-4 h-4 mr-1" />
                CSV
              </Button>
            </div>
            
            <ScrollArea className="h-[400px]">
              {winners.length === 0 ? (
                <div className="text-center text-white/50 py-8">
                  Chưa có người trúng thưởng
                </div>
              ) : (
                <div className="space-y-2">
                  {winners.map((w, i) => (
                    <motion.div
                      key={`${w.customer_code}-${i}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-emerald-400 font-bold">{w.customer_code}</span>
                        <span className="text-xs text-white/50">#{winners.length - i}</span>
                      </div>
                      <div className="text-sm text-white">{w.customer_name}</div>
                      <div className="text-xs text-yellow-400 font-mono">{w.prize_code}</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            {winners.length > 0 && (
              <Button
                onClick={onReset}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa Lịch Sử
              </Button>
            )}
          </TabsContent>
          
          <TabsContent value="settings" className="mt-4 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-white/70">Tránh trùng lặp</Label>
                <Switch
                  checked={settings.avoidDuplicates}
                  onCheckedChange={(v) => onSettingsChange({ avoidDuplicates: v })}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white/70">Thời lượng quay (ms)</Label>
                <Input
                  type="number"
                  value={settings.spinDuration}
                  onChange={(e) => onSettingsChange({ spinDuration: Number(e.target.value) })}
                  className="bg-white/5 border-white/10 text-white"
                  min={2000}
                  max={10000}
                  step={500}
                />
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <Label className="text-white/70 flex items-center gap-2">
                  {audioSettings.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  Âm thanh
                </Label>
                <Switch
                  checked={!audioSettings.muted}
                  onCheckedChange={onToggleMute}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white/50 text-sm">Nhạc nền</Label>
                <Slider
                  value={[audioSettings.bgmVolume * 100]}
                  onValueChange={([v]) => onBgmVolumeChange(v / 100)}
                  max={100}
                  step={5}
                  className="py-2"
                  disabled={audioSettings.muted}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white/50 text-sm">Hiệu ứng</Label>
                <Slider
                  value={[audioSettings.sfxVolume * 100]}
                  onValueChange={([v]) => onSfxVolumeChange(v / 100)}
                  max={100}
                  step={5}
                  className="py-2"
                  disabled={audioSettings.muted}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

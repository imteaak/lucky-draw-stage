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
  FaCog,
  FaUpload,
  FaHistory,
  FaDownload,
  FaVolumeUp,
  FaVolumeMute,
  FaUsers,
  FaTrophy,
  FaClock,
  FaTrash,
  FaFileCode,
  FaFileAlt
} from 'react-icons/fa';
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
          className="fixed top-4 right-4 z-40 bg-white/40 hover:bg-white/60 backdrop-blur-sm rounded-full w-12 h-12 shadow-md text-orange-800"
        >
          <FaCog className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] bg-white/95 border-l border-orange-200 backdrop-blur-xl">
        <SheetHeader>
          <SheetTitle className="text-orange-950 font-['Orbitron']">Bảng Điều Khiển</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="import" className="mt-6">
          <TabsList className="grid grid-cols-3 bg-orange-100/50">
            <TabsTrigger value="import" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <FaUpload className="w-4 h-4 mr-1" />
              Import
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <FaHistory className="w-4 h-4 mr-1" />
              Lịch sử
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <FaCog className="w-4 h-4 mr-1" />
              Cài đặt
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="mt-4 space-y-4">
            <div>
              <Label className="text-slate-600">Dán dữ liệu CSV hoặc JSON</Label>
              <Textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`JSON: [{"customer_code":"KH-001","prize_code":"GOLD-001","customer_name":"Nguyen Van A"}]

CSV:
customer_code,prize_code,customer_name
KH-001,GOLD-001,Nguyen Van A`}
                className="mt-2 h-40 bg-white border-orange-200 text-slate-800 font-mono text-sm focus:border-orange-500"
              />
              {importError && (
                <p className="text-red-500 text-sm mt-2">{importError}</p>
              )}
            </div>
            <Button onClick={handleImport} className="w-full bg-orange-600 hover:bg-orange-500 text-white shadow-md">
              <FaUpload className="w-4 h-4 mr-2" />
              Import Dữ Liệu ({participants.length} người)
            </Button>

            <div className="pt-4 border-t border-orange-100">
              <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                <span className="flex items-center gap-2">
                  <FaUsers className="w-4 h-4 text-orange-400" />
                  Tổng số
                </span>
                <span className="font-bold text-slate-800">{participants.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                <span className="flex items-center gap-2">
                  <FaTrophy className="w-4 h-4 text-red-400" />
                  Đã trúng
                </span>
                <span className="font-bold text-red-600">{winners.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <FaClock className="w-4 h-4 text-amber-400" />
                  Còn lại
                </span>
                <span className="font-bold text-amber-600">{participants.length - winners.length}</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4 space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={() => handleExport('json')}
                variant="outline"
                size="sm"
                className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                <FaFileCode className="w-4 h-4 mr-1" />
                JSON
              </Button>
              <Button
                onClick={() => handleExport('csv')}
                variant="outline"
                size="sm"
                className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                <FaFileAlt className="w-4 h-4 mr-1" />
                CSV
              </Button>
            </div>

            <ScrollArea className="h-[400px]">
              {winners.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  Chưa có người trúng thưởng
                </div>
              ) : (
                <div className="space-y-2">
                  {winners.map((w, i) => (
                    <motion.div
                      key={`${w.customer_code}-${i}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 rounded-lg bg-white border border-orange-100 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-orange-600 font-bold">{w.customer_code}</span>
                        <span className="text-xs text-slate-400">#{winners.length - i}</span>
                      </div>
                      <div className="text-sm text-slate-700">{w.customer_name}</div>
                      <div className="text-xs text-amber-600 font-mono">{w.prize_code}</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {winners.length > 0 && (
              <Button
                onClick={onReset}
                variant="destructive"
                className="w-full bg-red-600 hover:bg-red-500"
              >
                <FaTrash className="w-4 h-4 mr-2" />
                Xóa Lịch Sử
              </Button>
            )}
          </TabsContent>

          <TabsContent value="settings" className="mt-4 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-slate-700">Tránh trùng lặp</Label>
                <Switch
                  checked={settings.avoidDuplicates}
                  onCheckedChange={(v) => onSettingsChange({ avoidDuplicates: v })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700">Thời lượng quay (ms)</Label>
                <Input
                  type="number"
                  value={settings.spinDuration}
                  onChange={(e) => onSettingsChange({ spinDuration: Number(e.target.value) })}
                  className="bg-white border-orange-200 text-slate-800"
                  min={2000}
                  max={10000}
                  step={500}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-orange-100">
              <div className="flex items-center justify-between">
                <Label className="text-slate-700 flex items-center gap-2">
                  {audioSettings.muted ? <FaVolumeMute className="w-4 h-4" /> : <FaVolumeUp className="w-4 h-4" />}
                  Âm thanh
                </Label>
                <Switch
                  checked={!audioSettings.muted}
                  onCheckedChange={onToggleMute}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-500 text-sm">Nhạc nền</Label>
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
                <Label className="text-slate-500 text-sm">Hiệu ứng</Label>
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

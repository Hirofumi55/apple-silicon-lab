import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChipSpec, ChipSeries } from '../../types/chip';
import chipsData from '../../data/chips.json';

const chips = chipsData as ChipSpec[];

export default function InteractiveCompare() {
  const [activeSeries, setActiveSeries] = useState<ChipSeries>('m');
  const [selectedChipIds, setSelectedChipIds] = useState<string[]>([]);
  
  // URL parameters handling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const chipsParam = params.get('chips');
    if (chipsParam) {
      const ids = chipsParam.split(',').slice(0, 3);
      if (ids.length > 0) {
        setSelectedChipIds(ids);
        
        // Auto-select series based on first chip if present
        const firstChip = chips.find(c => c.id === ids[0]);
        if (firstChip) {
          setActiveSeries(firstChip.series);
        }
      }
    } else {
      // Default selection based on series
      const defaultM = chips.filter(c => c.series === 'm').slice(-2).map(c => c.id);
      setSelectedChipIds(defaultM);
    }
  }, []);

  // Update URL when selection changes
  useEffect(() => {
    if (selectedChipIds.length > 0) {
      const url = new URL(window.location.href);
      url.searchParams.set('chips', selectedChipIds.join(','));
      window.history.replaceState({}, '', url);
    }
  }, [selectedChipIds]);

  const toggleChipSelection = (id: string) => {
    setSelectedChipIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(chipId => chipId !== id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), id]; // Remove first, add new
      }
      return [...prev, id];
    });
  };

  const selectedChips = selectedChipIds
    .map(id => chips.find(c => c.id === id))
    .filter((c): c is ChipSpec => c !== undefined);

  const availableChips = chips.filter(c => c.series === activeSeries);

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-4 rounded-xl shadow-xl min-w-[200px] bg-bg-color/90 dark:bg-bg-color/90">
          <p className="font-bold mb-3 border-b border-glass pb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-text-sub">{entry.name}</span>
              </div>
              <span className="font-bold text-text-main ml-4">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Prepare chart data
  const chartData = [
    {
      metric: 'Geekbench (Multi)',
      ...selectedChips.reduce((acc, chip) => ({
        ...acc,
        [chip.name]: chip.benchmarks.geekbench6MultiCore || 0
      }), {})
    },
    {
      metric: 'Geekbench (Single)',
      ...selectedChips.reduce((acc, chip) => ({
        ...acc,
        [chip.name]: chip.benchmarks.geekbench6SingleCore || 0
      }), {})
    },
    ...(activeSeries === 'm' ? [{
      metric: 'Metal Score',
      ...selectedChips.reduce((acc, chip) => ({
        ...acc,
        [chip.name]: chip.benchmarks.metalScore || 0
      }), {})
    }] : [{
      metric: 'AnTuTu',
      ...selectedChips.reduce((acc, chip) => ({
        ...acc,
        [chip.name]: chip.benchmarks.antutu || 0
      }), {})
    }])
  ];

  return (
    <div className="flex flex-col gap-12">
      {/* Selector Section */}
      <div className="glass rounded-3xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold">Select Chips to Compare</h2>
          
          {/* Series Toggle */}
          <div className="flex bg-black/5 dark:bg-white/5 rounded-full p-1 border border-glass">
            <button
              onClick={() => setActiveSeries('m')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeSeries === 'm' ? 'bg-surface shadow-sm' : 'text-text-sub hover:text-text-main'
              }`}
            >
              M Series
            </button>
            <button
              onClick={() => setActiveSeries('a')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeSeries === 'a' ? 'bg-surface shadow-sm' : 'text-text-sub hover:text-text-main'
              }`}
            >
              A Series
            </button>
          </div>
        </div>

        {/* Chip Pills */}
        <div className="flex flex-wrap gap-3 mb-8">
          {availableChips.map(chip => {
            const isSelected = selectedChipIds.includes(chip.id);
            return (
              <button
                key={chip.id}
                onClick={() => toggleChipSelection(chip.id)}
                className={`px-4 py-2 rounded-full border text-sm transition-all flex items-center gap-2
                  ${isSelected 
                    ? 'border-transparent text-white dark:text-black font-medium shadow-md' 
                    : 'border-glass bg-surface/50 text-text-sub hover:border-text-sub/30'
                  }
                `}
                style={{
                  backgroundColor: isSelected ? chip.color : undefined,
                }}
              >
                {!isSelected && (
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chip.color }} />
                )}
                {chip.name}
              </button>
            );
          })}
        </div>

        <div className="text-sm text-text-sub flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          You can select up to 3 chips for comparison across any series.
        </div>
      </div>

      {/* Visual Chart Comparison */}
      {selectedChips.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 md:p-8"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              Performance Comparison
            </h3>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#888888" strokeOpacity={0.2} vertical={false} />
                <XAxis 
                  dataKey="metric" 
                  stroke="#888888" 
                  tick={{ fill: '#888888', fontSize: 13 }}
                  tickMargin={12}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#888888" 
                  tick={{ fill: '#888888', fontSize: 12 }} 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                
                {selectedChips.map((chip) => (
                  <Bar 
                    key={chip.id} 
                    dataKey={chip.name} 
                    fill={chip.color} 
                    radius={[6, 6, 0, 0]}
                    maxBarSize={60}
                    animationDuration={1500}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Comparison View */}
      {selectedChips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {selectedChips.map((chip, index) => (
              <motion.div
                key={chip.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                className="glass rounded-3xl p-6 md:p-8 flex flex-col relative overflow-hidden"
              >
                {/* Background glow */}
                <div 
                  className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" 
                  style={{ backgroundColor: chip.color }}
                />

                <div className="flex items-center justify-between mb-8 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full shadow-inner" style={{ backgroundColor: chip.color }} />
                    <h3 className="text-3xl font-bold tracking-tight">{chip.name}</h3>
                  </div>
                  <button 
                    onClick={() => toggleChipSelection(chip.id)}
                    className="p-2 -mr-2 text-text-sub hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                    aria-label="Remove chip"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>

                <div className="space-y-6 flex-grow z-10">
                  <div className="grid grid-cols-2 gap-4 pb-6 border-b border-glass">
                    <div>
                      <p className="text-xs text-text-sub uppercase tracking-wider mb-1">Process</p>
                      <p className="font-semibold text-lg">{chip.processNode}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-sub uppercase tracking-wider mb-1">Released</p>
                      <p className="font-semibold text-lg">{chip.releaseDate}</p>
                    </div>
                  </div>

                  <div className="pb-6 border-b border-glass">
                    <p className="text-xs text-text-sub uppercase tracking-wider mb-3">Processor</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">CPU Cores</span>
                        <span className="font-semibold">{chip.cpu.totalCores} <span className="text-text-sub text-xs font-normal">({chip.cpu.performanceCores}P + {chip.cpu.efficiencyCores}E)</span></span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">GPU Cores</span>
                        <span className="font-semibold">{chip.gpu.cores}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Neural Engine</span>
                        <span className="font-semibold">{chip.neuralEngine.tops} TOPS</span>
                      </div>
                    </div>
                  </div>

                  <div className="pb-6 border-b border-glass">
                    <p className="text-xs text-text-sub uppercase tracking-wider mb-3">Memory Architecture</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Bandwidth</span>
                        <span className="font-semibold">{chip.memory.bandwidthGBs} GB/s</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Max Capacity</span>
                        <span className="font-semibold">{chip.memory.maxCapacityGB} GB</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Type</span>
                        <span className="font-semibold">{chip.memory.type}</span>
                      </div>
                    </div>
                  </div>

                  {/* Highlights */}
                  {chip.highlights.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs text-text-sub uppercase tracking-wider mb-3">Highlights</p>
                      <ul className="space-y-2">
                        {chip.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <svg className="w-4 h-4 mt-0.5 shrink-0 text-accent" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

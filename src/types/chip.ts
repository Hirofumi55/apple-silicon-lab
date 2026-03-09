export type ChipSeries = 'm' | 'a';
export type ChipVariant = 'base' | 'pro' | 'max' | 'ultra';

export interface ChipSpec {
  id: string;                    // 例: "m5", "m5-pro", "a19-pro"
  slug: string;                  // URLスラッグ
  name: string;                  // 表示名: "Apple M5"
  series: ChipSeries;
  variant: ChipVariant;
  releaseDate: string;           // "2025-10"
  processNode: string;           // "3nm", "5nm"
  transistors?: string;          // "25 billion"
  
  cpu: {
    totalCores: number;
    performanceCores: number;
    efficiencyCores: number;
    superCores?: number;         // For M5
    maxClockSpeed?: string;      // "3.5 GHz"
  };
  
  gpu: {
    cores: number | string;      // "8-10"
    features: string[];          // ["Ray Tracing", "Dynamic Caching", "Neural Accelerator"]
  };
  
  neuralEngine: {
    cores: number;
    tops: number;                // TOPS (Trillion Operations Per Second)
  };
  
  memory: {
    type: string;                // "LPDDR5", "LPDDR5X"
    maxCapacityGB: number;
    bandwidthGBs: number | string; // "300-400"
  };
  
  benchmarks: {
    geekbench6SingleCore?: number;
    geekbench6MultiCore?: number;
    cinebenchR23SingleCore?: number;
    cinebenchR23MultiCore?: number;
    antutu?: number;
    metalScore?: number;
  };
  
  devices: string[];             // ["MacBook Pro 14\"", "MacBook Air 13\""]
  highlights: string[];          // ["世界最速CPUコア", "GPU Neural Accelerator搭載"]
  color: string;                 // チップ別カラーコード
}

'use client';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCw, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface ViewerControlsProps {
    intensity: number;
    setIntensity: (val: number) => void;
    autoRotate: boolean;
    setAutoRotate: (val: boolean) => void;
    className?: string;
}

export function ViewerControls({
    intensity,
    setIntensity,
    autoRotate,
    setAutoRotate,
    className
}: ViewerControlsProps) {
    const t = useTranslations('ViewerControls');

    return (
        <div className={cn("p-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col gap-4 w-full max-w-xs", className)}>

            {/* Lighting Control */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Sun className="w-3 h-3" /> {t('lighting')}
                    </label>
                    <span className="text-xs font-mono text-cyan-400">{intensity.toFixed(1)}</span>
                </div>
                <Slider
                    value={[intensity]}
                    min={0}
                    max={5}
                    step={0.1}
                    onValueChange={([v]) => setIntensity(v)}
                    className="py-2"
                />
            </div>

            {/* Auto Rotate */}
            <div className="pt-2 border-t border-white/10">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAutoRotate(!autoRotate)}
                    className={cn(
                        "w-full justify-between hover:bg-white/5",
                        autoRotate ? "text-cyan-400" : "text-gray-400"
                    )}
                >
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                        <RotateCw className={cn("w-3 h-3", autoRotate && "animate-spin")} />
                        {t('autoRotate')}
                    </span>
                    <span className="text-xs">{autoRotate ? t('on') : t('off')}</span>
                </Button>
            </div>
        </div>
    );
}

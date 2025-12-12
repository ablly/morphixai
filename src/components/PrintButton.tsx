'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export function PrintButton() {
    return (
        <Button
            onClick={() => window.print()}
            className="shadow-xl bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-6 h-auto flex flex-col gap-1"
        >
            <Printer className="w-6 h-6" />
            <span className="text-xs font-bold">PRINT LICENSE</span>
        </Button>
    );
}

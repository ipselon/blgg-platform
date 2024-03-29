import React from 'react';

export function ToolbarSection({children}: {children: React.ReactNode}) {
    return (
        <div className="absolute top-0 left-0 right-0 border-b-[1px] h-[53px] bordert-slate-200 p-2">
            {children}
        </div>
    );
}

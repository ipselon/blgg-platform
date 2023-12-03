import React from 'react';

export function CentralSection({children}: {children: React.ReactNode}) {
    return (
        <div className="absolute top-[53px] left-0 bottom-0 right-0 bg-slate-100">
            {children}
        </div>
    );
}

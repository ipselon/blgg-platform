import {ToolbarSection} from '@/components/layouts/ToolbarSection';
import {CentralSection} from '@/components/layouts/CentralSection';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Link} from 'react-router-dom';

export function WelcomeRoute() {
    return (
        <>
            <ToolbarSection>
                <div className="flex flex-row justify-between">
                </div>
            </ToolbarSection>
            <CentralSection>
                <ScrollArea className="w-full h-full p-4">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h2 className="text-xl">Welcome to Page Mosaic Platform Landing</h2>
                        </div>
                        <div>
                            <h2>The platform has only two features so far:</h2>
                        </div>
                        <div>
                            <Link className="text-xs hover:underline" to="/pages/main-page">Home Page Content</Link>
                        </div>
                        <div>
                            <Link className="text-xs hover:underline" to="/settings/sys-user-profile">System User Profile</Link>
                        </div>
                    </div>
                </ScrollArea>
            </CentralSection>
        </>
    );
}
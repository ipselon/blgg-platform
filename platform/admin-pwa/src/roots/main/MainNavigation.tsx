import {ScrollArea} from '@/components/ui/scroll-area';
import {ButtonLink} from '@/components/utils/ButtonLink';
import {LucideUserCircle, LucideSettings} from 'lucide-react';

export function MainNavigation() {
    return (
        <ScrollArea className="w-full h-full p-4">
            <div className="w-full flex flex-col gap-2">
                <div>
                    <ButtonLink
                        to="/settings/sys-user-profile"
                        end={false}
                        label="Settings"
                        className="w-full justify-start"
                        icon={<LucideSettings className=" h-4 w-4"/>}
                    />
                </div>
                <div>
                    <ButtonLink
                        to="/first"
                        end={false}
                        label="First"
                        className="w-full justify-start"
                        icon={<LucideUserCircle className=" h-4 w-4"/>}
                    />
                </div>
                <div>
                    <ButtonLink
                        to="/second"
                        end={false}
                        label="Second"
                        className="w-full justify-start"
                    />
                </div>
            </div>
        </ScrollArea>
    );
}
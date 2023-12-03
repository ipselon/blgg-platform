import {Outlet} from 'react-router-dom';
import {NavigationMenu, NavigationMenuList, NavigationMenuItem} from '@/components/ui/navigation-menu';
import {ToolbarSection} from '@/components/layouts/ToolbarSection';
import {CentralSection} from '@/components/layouts/CentralSection';
import {ButtonLink} from '@/components/utils/ButtonLink';

export function SecondRoute() {
    return (
        <>
            <ToolbarSection>
                <div className="flex flex-row justify-between">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem asChild={true}>
                                <ButtonLink
                                    to="/second/sub-third"
                                    end={true}
                                    label="Sub Third"
                                    className="w-full justify-start"
                                />
                            </NavigationMenuItem>
                            <NavigationMenuItem asChild={true}>
                                <ButtonLink
                                    to="/second/sub-fourth"
                                    end={true}
                                    label="Sub Fourth"
                                    className="w-full justify-start"
                                />
                            </NavigationMenuItem>
                            <NavigationMenuItem asChild={true}>
                                <ButtonLink
                                    to="/first/sub-first"
                                    end={true}
                                    label="Sub First"
                                    className="w-full justify-start"
                                />
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
            </ToolbarSection>
            <CentralSection>
                <Outlet />
            </CentralSection>
        </>
    );
}
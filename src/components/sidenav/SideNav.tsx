import React, { useCallback } from 'react'
import { SideNavigation, MenuSection, NavMenuItem, Icon } from '@momentum-design/components/react'
import { useNavigate, useLocation } from 'react-router-dom'
import './sidenav.css';

interface SideNavProps {
    isSideNavExpanded: boolean;
    setIsSideNavExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

const SideNav: React.FC<SideNavProps> = ({ isSideNavExpanded, setIsSideNavExpanded }: SideNavProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleSideNavToggle = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (e: any) => {
            const newToggleState = e.detail.expanded;
            setIsSideNavExpanded(newToggleState);
        }, [setIsSideNavExpanded],
    );

    const handleNavItemClick = useCallback((path: string) => {
        navigate(path);
    }, [navigate]);

    return (
        <>
            <SideNavigation expanded={isSideNavExpanded} onToggle={handleSideNavToggle} variant="flexible" footerText="Customer Name" grabberBtnAriaLabel="Toggle Side navigation" parentNavTooltipText="Contains active navmenuitem" className="sidenav">
                <MenuSection slot="scrollable-menubar" showDivider>
                    <NavMenuItem iconName="dashboard-regular" navId="1" label="Overview" onClick={() => handleNavItemClick('/')} active={location.pathname === '/'}></NavMenuItem>
                    <NavMenuItem iconName="alert-regular" navId="2" label="Alert center" onClick={() => handleNavItemClick('/')}></NavMenuItem>
                </MenuSection>
                <MenuSection slot="scrollable-menubar" showDivider headerText="AI studio">
                    <NavMenuItem iconName="sparkle-regular" navId="3" label="AI hub" onClick={() => handleNavItemClick('/')}></NavMenuItem>
                    <NavMenuItem iconName="bot-regular" navId="4" label="Control hub agent" onClick={() => handleNavItemClick('/ai-agent')} active={location.pathname === '/ai-agent'}></NavMenuItem>
                </MenuSection>
                <MenuSection slot="scrollable-menubar" showDivider headerText="Monitoring">
                    <NavMenuItem iconName="analysis-regular" navId="5" label="Analytics" onClick={() => handleNavItemClick('/')}></NavMenuItem>
                    <NavMenuItem iconName="diagnostics-regular" navId="6" label="Troubleshooting" onClick={() => handleNavItemClick('/')}></NavMenuItem>
                    <NavMenuItem iconName="document-regular" navId="7" label="Reports" onClick={() => handleNavItemClick('/')}></NavMenuItem>
                </MenuSection>
                <MenuSection slot="scrollable-menubar" headerText="Management">
                    <NavMenuItem iconName="user-regular" navId="11" label="Users" onClick={() => handleNavItemClick('/')}></NavMenuItem>
                    <NavMenuItem iconName="people-regular" navId="12" label="Groups" onClick={() => handleNavItemClick('/')}></NavMenuItem>
                    <NavMenuItem iconName="location-regular" navId="13" label="Locations" onClick={() => handleNavItemClick('/')}></NavMenuItem>
                    <NavMenuItem iconName="folder-regular" navId="14" label="Workspaces" onClick={() => handleNavItemClick('/')}></NavMenuItem>
                    <NavMenuItem iconName="devices-regular" navId="15" label="Devices" onClick={() => handleNavItemClick('/')}></NavMenuItem>
                    <NavMenuItem iconName="apps-regular" navId="16" label="Apps" onClick={() => handleNavItemClick('/')}></NavMenuItem>
                    <NavMenuItem iconName="company-regular" navId="17" label="Account" onClick={() => handleNavItemClick('/')}></NavMenuItem>
                    <NavMenuItem iconName="blocked-regular" navId="18" label="Security & Privacy" onClick={() => handleNavItemClick('/')}></NavMenuItem>
                    <NavMenuItem iconName="settings-regular" navId="19" label="Organization Settings" onClick={() => handleNavItemClick('/')}></NavMenuItem>
                </MenuSection>
                {/* <MenuSection slot="fixed-menubar" >
                    <NavMenuItem iconName="placeholder-regular" navId="21" label="Label"></NavMenuItem>
                    <NavMenuItem iconName="placeholder-regular" navId="22" label="Label"></NavMenuItem>
                    <NavMenuItem iconName="placeholder-regular" navId="23" label="Label"></NavMenuItem>
                    <NavMenuItem iconName="placeholder-regular" navId="24" label="Label"></NavMenuItem>
                    <NavMenuItem iconName="placeholder-regular" navId="25" label="Label"></NavMenuItem>
                </MenuSection> */}
                <Icon slot="brand-logo" name="apple-bold"></Icon>
            </SideNavigation>
        </>
    );
};

export default SideNav;
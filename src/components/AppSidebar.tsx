import {
  Home,
  BookText,
  Images,
  Calendar,
  ChefHat,
  Binoculars,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "./NavUser";

// This is sample data.
const data = {
  user: {
    name: "Ben",
    email: "Ben@bumpityroad.com",
    avatar: "/avatars/shadcn.jpg",
  },
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: "Getting Started",
      url: "#",
      items: [
        {
          title: "Cabin",
          url: "#",
          icon: <Home />,
        },
        {
          title: "SOP",
          url: "#",
          icon: <BookText />,
        },
        {
          title: "Gallery",
          url: "#",
          icon: <Images />,
        },
        {
          title: "Calendar",
          url: "#",
          icon: <Calendar />,
        },
        {
          title: "Recipes",
          url: "#",
          icon: <ChefHat />,
        },
        {
          title: "Wildlife",
          url: "#",
          icon: <Binoculars />,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <a href={item.url}>
                        {item.icon}
                        {item.title}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

import {
  Home,
  BookText,
  Images,
  Calendar,
  ChefHat,
  Binoculars,
  Map,
  Notebook,
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
    avatar:
      "https://images.pexels.com/photos/19501326/pexels-photo-19501326/free-photo-of-woman-hands-cutting-simit-for-breakfast.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
  },

  navMain: [
    {
      title: "Getting Started",
      url: "#",
      items: [
        {
          title: "Cabin",
          url: "/",
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
        {
          title: "Adventure",
          url: "#",
          icon: <Map />,
        },
        {
          title: "Blog",
          url: "/blog",
          icon: <Notebook />,
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

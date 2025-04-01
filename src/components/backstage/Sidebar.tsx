import * as React from "react"
import { Vote } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Link } from "react-router"

// check path is active
function isActive(path: string) {
  return window.location.pathname === path
}

// get Vote ID from URL Query
function hasVoteId() {
  const params = new URLSearchParams(window.location.search)
  return params.has("voteId")
}

const data = {
  navMain: [
    {
      title: "投票管理",
      url: "/vote",
      isActive: isActive("/backstage/vote"),
      items: [
        {
          title: "編輯",
          url: "/question",
          isActive: isActive("/backstage/vote/update"),
          visible: hasVoteId()
        },
        {
          title: "問題",
          url: "/question",
          isActive: isActive("/backstage/question"),
          visible: hasVoteId()
        },
      ],
    },
    {
      title: "設定",
      url: "#",
      isActive: false,
      items: [
        {
          title: "使用者資料",
          url: "#",
          isActive: isActive("/backstage/user-profile"),
          visible: true
        },
        {
          title: "系統設定",
          url: "#",
          isActive: isActive("/backstage/settings"),
          visible: true
        },
      ],
    },
  ],
}

export function BackSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/backstage">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Vote className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">MyVote</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={item.isActive}>
                  <a href={"/backstage"+item.url} className="font-medium">
                    {item.title}
                  </a>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub>
                    {item.items.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild isActive={item.isActive}>
                            <Link to={"/backstage"+item.url} className={item.visible ? "" : "hidden"}>{item.title}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

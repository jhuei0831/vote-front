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
  return path.includes(window.location.pathname)
}

// check if the URL contains "voteId"
function hasVoteId() {
  const params = new URLSearchParams(window.location.search)
  return params.has("voteId")
}

// get Vote ID from URL Query
function getVoteId() {
  const params = new URLSearchParams(window.location.search)
  return params.get("voteId")
}

const data = {
  navMain: [
    {
      title: "投票管理",
      url: "/vote",
      items: [
        {
          title: "編輯",
          url: "/vote/update" + `?voteId=${getVoteId()}`,
          visible: hasVoteId(),
        },
        {
          title: "問題",
          url: "/question" + `?voteId=${getVoteId()}`,
          visible: hasVoteId(),
        },
        {
          title: "候選",
          url: "/candidate" + `?voteId=${getVoteId()}`,
          visible: hasVoteId(),
        },
        {
          title: "密碼",
          url: "/password" + `?voteId=${getVoteId()}`,
          visible: hasVoteId(),
        },
        {
          title: "選票",
          url: "/ballot" + `?voteId=${getVoteId()}`,
          visible: hasVoteId(),
        },
        {
          title: "計票",
          url: "/count" + `?voteId=${getVoteId()}`,
          visible: hasVoteId(),
        },
      ],
    },
    {
      title: "設定",
      url: "#",
      items: [
        {
          title: "使用者資料",
          url: "/backstage/user-profile",
          visible: true,
        },
        {
          title: "系統設定",
          url: "/backstage/settings",
          visible: true,
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
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/backstage" + item.url)}
                >
                  <a href={"/backstage" + item.url} className="font-medium">
                    {item.title}
                  </a>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isActive("/backstage" + subItem.url)}
                        >
                          <Link
                            to={"/backstage" + subItem.url}
                            className={subItem.visible ? "" : "hidden"}
                          >
                            {subItem.title}
                          </Link>
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
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
import { Link, useParams, useRouterState } from "@tanstack/react-router"

// 側邊欄元件
export function BackSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // 使用選擇器以減少不必要的重新渲染
  const pathname = useRouterState({ 
    select: (s) => s.location.pathname 
  })

  // 只能在元件內部呼叫 useParams
  const { voteId } = useParams({ strict: false })

  // 檢查 URL 是否有 voteId
  function hasVoteId() {
    return voteId !== undefined && voteId !== null && voteId !== ""
  }
  
  // 導航資料，依賴 voteId
  const data = {
    navMain: [
      {
        title: "投票管理",
        url: `${voteId == null ? "/" : `/vote/${voteId}`}`,
        isActive: pathname === `/backstage/vote/${voteId}` || pathname === "/backstage",
        items: [
          {
            title: "編輯",
            url: `/vote/${voteId}/update`,
            visible: hasVoteId(),
            isActive: pathname === `/backstage/vote/${voteId}/update`,
          },
          {
            title: "問題",
            url: `/question/${voteId}`,
            visible: hasVoteId(),
            isActive: pathname === `/backstage/question/${voteId}`,
          },
          {
            title: "候選",
            url: `/candidate/${voteId}`,
            visible: hasVoteId(),
            isActive: pathname === `/backstage/candidate/${voteId}`,
          },
          {
            title: "密碼",
            url: `/password/${voteId}`,
            visible: hasVoteId(),
            isActive: pathname === `/backstage/password/${voteId}`,
          },
          {
            title: "選票",
            url: `/ballot/${voteId}`,
            visible: hasVoteId(),
            isActive: pathname === `/backstage/ballot/${voteId}`,
          },
          {
            title: "計票",
            url: `/count/${voteId}`,
            visible: hasVoteId(),
            isActive: pathname === `/backstage/count/${voteId}`,
          },
        ],
      },
      {
        title: "設定",
        url: "#",
        items: [
          {
            title: "使用者資料",
            url: "/user-profile",
            visible: true,
            isActive: pathname === "/backstage/user-profile",
          },
          {
            title: "系統設定",
            url: "/settings",
            visible: true,
            isActive: pathname === "/backstage/settings",
          },
        ],
      },
    ],
  }

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
        {/* <SidebarGroup> */}
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={item.isActive}
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
                          isActive={subItem.isActive}
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
        {/* </SidebarGroup> */}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
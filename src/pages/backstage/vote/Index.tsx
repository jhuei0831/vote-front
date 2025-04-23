import Layout from "@/components/backstage/BackLayout";
import {
  AcademicCapIcon,
  BanknotesIcon,
  CheckBadgeIcon,
  ClockIcon,
  ReceiptRefundIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { useParams } from "@tanstack/react-router";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Index() {
  const { voteId } = useParams({strict: false});

  const actions = [
    {
      title: '編輯投票設定',
      description: '編輯投票的基本設定',
      href: voteId != null ? `/backstage/vote/${voteId}/update` : '/backstage',
      icon: ClockIcon,
      iconForeground: 'text-teal-700',
      iconBackground: 'bg-teal-50',
    },
    {
      title: '問題管理',
      description: '編輯投票的問題',
      href: voteId != null ? `/backstage/question/${voteId}` : '/backstage',
      icon: CheckBadgeIcon,
      iconForeground: 'text-purple-700',
      iconBackground: 'bg-purple-50',
    },
    {
      title: '候選管理',
      description: '編輯投票的候選人',
      href: voteId != null ? `/backstage/candidate/${voteId}` : '/backstage',
      icon: UsersIcon,
      iconForeground: 'text-sky-700',
      iconBackground: 'bg-sky-50',
    },
    {
      title: '密碼管理',
      description: '編輯投票的密碼',
      href: voteId != null ? `/backstage/password/${voteId}` : '/backstage',
      icon: BanknotesIcon,
      iconForeground: 'text-yellow-700',
      iconBackground: 'bg-yellow-50',
    },
    {
      title: '選票管理',
      description: '編輯投票的選票',
      href: voteId != null ? `/backstage/ballot/${voteId}` : '/backstage',
      icon: ReceiptRefundIcon,
      iconForeground: 'text-rose-700',
      iconBackground: 'bg-rose-50',
    },
    {
      title: '計票',
      description: '編輯投票的計票',
      href: voteId != null ? `/backstage/count/${voteId}` : '/backstage',
      icon: AcademicCapIcon,
      iconForeground: 'text-indigo-700',
      iconBackground: 'bg-indigo-50',
    },
  ]
  
  return (
    <Layout>
      <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 shadow-sm sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0">
      {actions.map((action, actionIdx) => (
        <div
          key={action.title}
          className={classNames(
            actionIdx === 0 ? 'rounded-tl-lg rounded-tr-lg sm:rounded-tr-none' : '',
            actionIdx === 1 ? 'sm:rounded-tr-lg' : '',
            actionIdx === actions.length - 2 ? 'sm:rounded-bl-lg' : '',
            actionIdx === actions.length - 1 ? 'rounded-br-lg rounded-bl-lg sm:rounded-bl-none' : '',
            'group relative bg-white p-6 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-inset',
          )}
        >
          <div>
            <span
              className={classNames(
                action.iconBackground,
                action.iconForeground,
                'inline-flex rounded-lg p-3 ring-4 ring-white',
              )}
            >
              <action.icon aria-hidden="true" className="size-6" />
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-base font-semibold text-gray-900">
              <a href={action.href} className="focus:outline-hidden">
                {/* Extend touch target to entire panel */}
                <span aria-hidden="true" className="absolute inset-0" />
                {action.title}
              </a>
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {action.description}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
          >
            <svg fill="currentColor" viewBox="0 0 24 24" className="size-6">
              <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
            </svg>
          </span>
        </div>
      ))}
    </div>
    </Layout>
  )
}
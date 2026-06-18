import { useEffect } from 'react'

const APP_NAME = 'Propostei'

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${APP_NAME} | ${title}`
    return () => { document.title = APP_NAME }
  }, [title])
}

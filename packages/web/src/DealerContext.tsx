import { createContext, useContext } from 'react'

const DealerBasePathContext = createContext('/')

export function DealerBasePathProvider({
  basePath,
  children,
}: {
  basePath: string
  children: React.ReactNode
}) {
  return (
    <DealerBasePathContext.Provider value={basePath}>
      {children}
    </DealerBasePathContext.Provider>
  )
}

/** Returns a function that prefixes a path with the current dealer's base path. */
export function useDealerPath() {
  const basePath = useContext(DealerBasePathContext)
  return (path: string) => {
    if (path === '/') return basePath
    return `${basePath}${path}`
  }
}

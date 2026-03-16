import { createContext, useContext, useState, useCallback } from 'react'

const SidebarContext = createContext(null)

export function SidebarProvider({ children }) {
  const [filterPanel, setFilterPanel] = useState(null)
  const clearFilter = useCallback(() => setFilterPanel(null), [])

  return (
    <SidebarContext.Provider value={{ filterPanel, setFilterPanel, clearFilter }}>
      {children}
    </SidebarContext.Provider>
  )
}

/** Returns null when used outside CustomerLayout (e.g. public layout). */
export const useSidebar = () => useContext(SidebarContext)

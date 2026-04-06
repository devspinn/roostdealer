import { Routes, Route, useParams, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import Inventory from '@/pages/Inventory'
import UnitDetail from '@/pages/UnitDetail'
import Contact from '@/pages/Contact'
import DealerDirectory from '@/pages/DealerDirectory'
import { DealerBasePathProvider } from '@/DealerContext'
import { dealers } from '@/data/dealers'

function DealerSite() {
  const { slug } = useParams<{ slug: string }>()
  const data = slug ? dealers[slug] : undefined

  if (!data) {
    return <Navigate to="/" replace />
  }

  const { dealer, units } = data
  const basePath = `/${slug}`

  return (
    <DealerBasePathProvider basePath={basePath}>
      <Layout dealer={dealer}>
        <Routes>
          <Route path="/" element={<Home dealer={dealer} units={units} />} />
          <Route path="/inventory" element={<Inventory units={units} dealer={dealer} />} />
          <Route
            path="/inventory/:id"
            element={<UnitDetail units={units} dealer={dealer} />}
          />
          <Route path="/contact" element={<Contact dealer={dealer} />} />
        </Routes>
      </Layout>
    </DealerBasePathProvider>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<DealerDirectory />} />
      <Route path="/:slug/*" element={<DealerSite />} />
    </Routes>
  )
}

export default App

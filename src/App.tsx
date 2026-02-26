import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DomI18nBridge from './i18n/DomI18nBridge'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Inbound from './pages/Inbound'
import Outbound from './pages/Outbound'
import Inventory from './pages/Inventory'
import ItemRegistration from './pages/ItemRegistration'
import StockControl from './pages/StockControl'
import Returns from './pages/Returns'
import WavePlanning from './pages/WavePlanning'
import SlaMonitor from './pages/SlaMonitor'
import MasterData from './pages/MasterData'
import CycleCount from './pages/CycleCount'
import OperationsReport from './pages/OperationsReport'
import LogicExplanation from './pages/LogicExplanation'
import LocationManagement from './pages/LocationManagement'
import PutawayReplenishment from './pages/PutawayReplenishment'
import PackingDispatch from './pages/PackingDispatch'
import TaskLaborManagement from './pages/TaskLaborManagement'
import LpnEquipment from './pages/LpnEquipment'
import Billing from './pages/Billing'

function App() {
  return (
    <BrowserRouter>
      <DomI18nBridge />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inbound" element={<Inbound />} />
        <Route path="/outbound" element={<Outbound />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/items/new" element={<ItemRegistration />} />
        <Route path="/stock-control" element={<StockControl />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="/waves" element={<WavePlanning />} />
        <Route path="/sla-monitor" element={<SlaMonitor />} />
        <Route path="/master-data" element={<MasterData />} />
        <Route path="/location-management" element={<LocationManagement />} />
        <Route path="/putaway-replenishment" element={<PutawayReplenishment />} />
        <Route path="/packing-dispatch" element={<PackingDispatch />} />
        <Route path="/task-labor-management" element={<TaskLaborManagement />} />
        <Route path="/lpn-equipment" element={<LpnEquipment />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/cycle-count" element={<CycleCount />} />
        <Route path="/operations-report" element={<OperationsReport />} />
        <Route path="/logic-explanation" element={<LogicExplanation />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App

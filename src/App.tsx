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
import OrderManagement from './pages/OrderManagement'
import CrossDocking from './pages/CrossDocking'
import LotBatchExpiry from './pages/LotBatchExpiry'
import SerialTracking from './pages/SerialTracking'
import YardManagement from './pages/YardManagement'
import AsnScheduling from './pages/AsnScheduling'
import InventoryAuditTrail from './pages/InventoryAuditTrail'
import DisposalManagement from './pages/DisposalManagement'
import NotificationCenter from './pages/NotificationCenter'
import SystemConfiguration from './pages/SystemConfiguration'
import MultiWarehouse from './pages/MultiWarehouse'
import KitBomManagement from './pages/KitBomManagement'
import QualityControl from './pages/QualityControl'
import ShippingTms from './pages/ShippingTms'

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
        <Route path="/order-management" element={<OrderManagement />} />
        <Route path="/cross-docking" element={<CrossDocking />} />
        <Route path="/lot-batch-expiry" element={<LotBatchExpiry />} />
        <Route path="/serial-tracking" element={<SerialTracking />} />
        <Route path="/yard-management" element={<YardManagement />} />
        <Route path="/asn-scheduling" element={<AsnScheduling />} />
        <Route path="/inventory-audit-trail" element={<InventoryAuditTrail />} />
        <Route path="/disposal-management" element={<DisposalManagement />} />
        <Route path="/notification-center" element={<NotificationCenter />} />
        <Route path="/system-configuration" element={<SystemConfiguration />} />
        <Route path="/multi-warehouse" element={<MultiWarehouse />} />
        <Route path="/kit-bom" element={<KitBomManagement />} />
        <Route path="/quality-control" element={<QualityControl />} />
        <Route path="/shipping-tms" element={<ShippingTms />} />
        <Route path="/cycle-count" element={<CycleCount />} />
        <Route path="/operations-report" element={<OperationsReport />} />
        <Route path="/logic-explanation" element={<LogicExplanation />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App

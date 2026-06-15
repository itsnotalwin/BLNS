import { create } from 'zustand';
import { 
  Shipment, Vehicle, Driver, Invoice, FuelLog, WorkOrder, Route, 
  BorderPost, CustomsDecl, Customer, AppNotification, ActivityLog, Settings, AppDocument, Permit, WarehouseConsignment
} from '../types';

interface AppState {
  shipments: Shipment[];
  fleet: Vehicle[];
  drivers: Driver[];
  invoices: Invoice[];
  fuel: FuelLog[];
  workOrders: WorkOrder[];
  documents: AppDocument[];
  permits: Permit[];
  routes: Route[];
  borders: BorderPost[];
  customs: CustomsDecl[];
  customers: Customer[];
  notifications: AppNotification[];
  activity: ActivityLog[];
  settings: Settings;
  warehouseConsignments: WarehouseConsignment[];
  
  // Actions
  addWarehouseConsignment: (w: WarehouseConsignment) => void;
  updateWarehouseConsignment: (id: string, updated: Partial<WarehouseConsignment>) => void;
  deleteWarehouseConsignment: (id: string) => void;
  
  addShipment: (s: Shipment) => void;
  updateShipment: (id: string, updated: Partial<Shipment>) => void;
  deleteShipment: (id: string) => void;
  deleteShipments: (ids: string[]) => void;
  
  addVehicle: (v: Vehicle) => void;
  updateVehicle: (unit: string, updated: Partial<Vehicle>) => void;
  deleteVehicle: (unit: string) => void;

  addDriver: (d: Driver) => void;
  updateDriver: (empId: string, updated: Partial<Driver>) => void;
  deleteDriver: (empId: string) => void;

  addInvoice: (i: Invoice) => void;
  updateInvoice: (no: string, updated: Partial<Invoice>) => void;
  deleteInvoice: (no: string) => void;

  addFuel: (f: FuelLog) => void;
  deleteFuel: (index: number) => void;

  addWorkOrder: (w: WorkOrder) => void;
  updateWorkOrder: (no: string, updated: Partial<WorkOrder>) => void;
  deleteWorkOrder: (no: string) => void;

  addDocument: (doc: AppDocument) => void;
  updateDocument: (name: string, updated: Partial<AppDocument>) => void;
  deleteDocument: (name: string) => void;

  addPermit: (p: Permit) => void;
  updatePermit: (num: string, updated: Partial<Permit>) => void;
  deletePermit: (num: string) => void;

  addRoute: (r: Route) => void;
  updateRoute: (name: string, updated: Partial<Route>) => void;
  deleteRoute: (name: string) => void;

  addCustomer: (c: Customer) => void;
  updateCustomer: (name: string, updated: Partial<Customer>) => void;
  deleteCustomer: (name: string) => void;

  addBorder: (b: BorderPost) => void;
  updateBorder: (name: string, updated: Partial<BorderPost>) => void;
  deleteBorder: (name: string) => void;

  addCustoms: (c: CustomsDecl) => void;
  updateCustoms: (awb: string, updated: Partial<CustomsDecl>) => void;
  deleteCustoms: (awb: string) => void;

  addActivity: (title: string, sub: string, type: 'gr' | 'rd' | 'ac' | 'bl' | 'pu') => void;
  updateSettings: (s: Partial<Settings>) => void;
  toggleNotification: (id: number) => void;
  clearNotifications: () => void;
}

export const useStore = create<AppState>((set) => ({
  shipments: [
    {id:'TAF-2406-881',customer:'Shoprite Holdings',origin:'Johannesburg',destCity:'Gaborone',country:'Botswana',commodity:'Retail Goods',weight:18.4,vehicle:'TA-001',driver:'Moses Sithole',border:'Tlokweng Gate',status:'In Transit',eta:'2026-06-02',rate:920,notes:''},
    {id:'TAF-2406-882',customer:'AECI Limited',origin:'Cape Town',destCity:'Windhoek',country:'Namibia',commodity:'Chemicals',weight:24.0,vehicle:'TA-007',driver:'Petrus Khama',border:'Vioolsdrift',status:'Customs Hold',eta:'2026-06-04',rate:1100,notes:'Hazardous — Class 3'},
    {id:'TAF-2406-883',customer:'Foschini Group',origin:'Durban',destCity:'Mbabane',country:'Eswatini',commodity:'Textiles',weight:9.6,vehicle:'TA-014',driver:'Nomsa Zwane',border:'Oshoek/Ngwenya',status:'Delivered',eta:'2026-06-01',rate:760,notes:''},
    {id:'TAF-2406-884',customer:'PPC Cement',origin:'Johannesburg',destCity:'Maseru',country:'Lesotho',commodity:'Building Materials',weight:32.5,vehicle:'TA-003',driver:'David Lefu',border:'Maseru Bridge',status:'Loading',eta:'2026-06-05',rate:840,notes:'Oversize load'},
    {id:'TAF-2406-885',customer:'Mustek Ltd',origin:'Johannesburg',destCity:'Harare',country:'Zimbabwe',commodity:'Electronics',weight:7.2,vehicle:'TA-022',driver:'Thabiso Mokoena',border:'Beit Bridge',status:'Delayed',eta:'2026-06-07',rate:1250,notes:'Beit Bridge backlog'},
  ],
  fleet: [
    {unit:'TA-001',make:'Volvo',model:'FH16',type:'Flatbed',reg:'GP 12-34 TX',payload:34,odometer:148320,nextService:165000,insurance:'2026-12-01',crossBorder:'BW, ZW, ZM',status:'Running'},
    {unit:'TA-003',make:'Scania',model:'G460',type:'Flatbed',reg:'GP 55-22 MK',payload:30,odometer:112000,nextService:120000,insurance:'2026-10-15',crossBorder:'LS, BW',status:'Running'},
    {unit:'TA-007',make:'Mercedes',model:'Actros 2644',type:'Tanker',reg:'WC 88-90 MP',payload:28,odometer:149900,nextService:150000,insurance:'2026-11-01',crossBorder:'NA',status:'Service Due'},
  ],
  drivers: [
    {name:'Moses Sithole',empId:'EMP-0041',licence:'EC',prdp:'Valid',prdpExp:'2027-08-15',countries:'BW, ZW, ZM',hours:142,trips:18,vehicle:'TA-001',phone:'+27 82 111 2222',rating:9.2,status:'On Route'},
    {name:'Petrus Khama',empId:'EMP-0055',licence:'EC',prdp:'Renewing',prdpExp:'2026-06-30',countries:'NA, BW',hours:128,trips:14,vehicle:'TA-007',phone:'+27 83 222 3333',rating:8.8,status:'At Border'},
  ],
  invoices: [
    {no:'INV-0441',customer:'Shoprite Holdings',amount:42800,issued:'2026-05-28',due:'2026-06-11',status:'Paid',notes:''},
    {no:'INV-0442',customer:'AECI Limited',amount:78400,issued:'2026-05-29',due:'2026-06-12',status:'Pending',notes:'Hazmat surcharge included'},
  ],
  fuel: [
    {date:'2026-06-10',vehicle:'TA-001',driver:'Moses Sithole',location:'Johannesburg (Depot)',country:'🇿🇦 SA',litres:800,rate:24.80,total:19840},
    {date:'2026-06-12',vehicle:'TA-007',driver:'Petrus Khama',location:'Windhoek BP',country:'🇳🇦 NA',litres:650,rate:23.50,total:15275},
    {date:'2026-06-14',vehicle:'TA-014',driver:'Nomsa Zwane',location:'Mbabane Shell',country:'🇸🇿 SZ',litres:300,rate:26.10,total:7830},
  ],
  workOrders: [
    {no:'WO-2601',vehicle:'TA-007',type:'Service',desc:'150,000km Major Service',workshop:'JHB Main Depot',opened:'2026-06-10',eta:'2026-06-12',cost:14500,status:'Completed',priority:'Normal'},
    {no:'WO-2602',vehicle:'TA-022',type:'Repair',desc:'Replace front left tire',workshop:'Beit Bridge Repair',opened:'2026-06-14',eta:'2026-06-15',cost:4200,status:'In Progress',priority:'High'},
    {no:'WO-2603',vehicle:'TA-003',type:'Maintenance',desc:'Trailer brake calibration',workshop:'JHB Main Depot',opened:'2026-06-16',eta:'2026-06-16',cost:0,status:'Scheduled',priority:'Normal'},
  ],
  documents: [
    {name:'Commercial Invoice INV-0442',type:'Invoice',shipment:'TAF-2406-882',country:'🇳🇦 Namibia',uploaded:'2026-06-01',expiry:'2026-12-01',status:'Valid'},
    {name:'SADC Certificate of Origin',type:'Customs',shipment:'TAF-2406-882',country:'🇳🇦 Namibia',uploaded:'2026-06-02',expiry:'2026-08-01',status:'Valid'},
    {name:'Missing DA-65 Declaration',type:'Customs',shipment:'TAF-2406-882',country:'🇳🇦 Namibia',uploaded:'2026-06-04',expiry:'2026-06-04',status:'Missing'},
    {name:'Proof of Delivery TAF-883',type:'POD',shipment:'TAF-2406-883',country:'🇸🇿 Eswatini',uploaded:'2026-06-02',expiry:'2028-06-02',status:'Valid'},
  ],
  permits: [
    {name:'Cross-Border Transit Permit',owner:'TA-001 (Volvo)',country:'🇧🇼 Botswana',issued:'2025-10-01',expiry:'2026-10-01',num:'CBP-BW-4820',status:'Valid'},
    {name:'SADC Carrier Licence',owner:'TransAfrica Freight',country:'Multiple',issued:'2024-06-01',expiry:'2026-06-30',num:'SADC-9118-TF',status:'Expiring'},
    {name:'Dangerous Goods Cert',owner:'TA-007 (Mercedes)',country:'🇳🇦 Namibia',issued:'2025-05-15',expiry:'2026-05-15',num:'DGC-NA-301',status:'Expired'},
  ],
  routes: [
    {name:'North Corridor',from:'Johannesburg',to:'Gaborone',km:365,border:'Tlokweng Gate / Kopfontein',avgTime:6,wait:1.2,activeShips:28,status:'Operational'},
    {name:'Trans-Kalahari',from:'Johannesburg',to:'Windhoek',km:1580,border:'Nakop / Ariamsvlei',avgTime:23,wait:3.4,activeShips:14,status:'Congested'},
  ],
  borders: [
    {name:'Tlokweng Gate',countries:'SA/BW',wait:1.2,trucks:4,status:'Open'},
    {name:'Vioolsdrift',countries:'SA/NA',wait:3.4,trucks:12,status:'Congested'},
  ],
  customs: [
    {awb:'TAF-2406-882',border:'Vioolsdrift',country:'🇳🇦 Namibia',commodity:'Chemicals',docsOk:6,docsTotal:8,status:'Hold — Missing DA-65'},
  ],
  customers: [
    {name:'Shoprite Holdings',country:'🇿🇦 🇧🇼 🇿🇼',email:'procurement@shoprite.co.za',ships:22,revenue:482000,outstanding:0,credit:1000000,tier:'Platinum',status:'Active'},
  ],
  notifications: [
    {id:1,type:'crit',title:'Beit Bridge — Critical Backlog',msg:'Queue exceeds 6h. TAF-885 delayed. Notify customer.',time:'13:05',unread:true},
  ],
  activity: [
    {type:'gr',title:'TAF-2406-883 Delivered',sub:'Mbabane depot received 9.6T textiles',time:'14:22'},
    {type:'rd',title:'Beit Bridge — Backlog Alert',sub:'Wait time exceeded 6h SLA threshold',time:'13:05'},
  ],
  settings: {company:'TransAfrica Freight (Pty) Ltd',vat:'4180192371',sars:'CBRC-12445',office:'14 Freight Park, Linbro, Johannesburg',emergency:'+27 11 000 1234',dispatcher:'Alwin',borderAlert:4,permitWarn:60,serviceWarn:2000,invoiceWarn:14,hoursLimit:60},
  warehouseConsignments: [
    {
      id: 'WH-001',
      shipmentId: 'TAF-2406-882',
      customer: 'AECI Limited',
      warehouseName: 'Vioolsdrift Border Facility',
      commodity: 'Chemicals',
      weight: 24.0,
      entryDate: '2026-06-12',
      daysStored: 3,
      reason: 'Customs Paperwork Pending',
      status: 'Stored',
      dailyCost: 1200,
      notes: 'Missing DA-65 Declaration, hazardous class 3 cargo.'
    },
    {
      id: 'WH-002',
      shipmentId: 'TAF-2406-885',
      customer: 'Mustek Ltd',
      warehouseName: 'Beit Bridge Depot & Storage',
      commodity: 'Electronics',
      weight: 7.2,
      entryDate: '2026-06-14',
      daysStored: 1,
      reason: 'Border Congestion / Wait Times',
      status: 'Stored',
      dailyCost: 950,
      notes: 'Safe secure hold due to Beit Bridge queue lines exceeding 6h SLA limit.'
    },
    {
      id: 'WH-003',
      shipmentId: 'TAF-2406-884',
      customer: 'PPC Cement',
      warehouseName: 'Ramotswa Holding Yard',
      commodity: 'Building Materials',
      weight: 32.5,
      entryDate: '2026-06-14',
      daysStored: 1,
      reason: 'Hazardous Escort / Oversized Limit',
      status: 'Inspecting',
      dailyCost: 1500,
      notes: 'Oversize escort clearance paperwork expected tomorrow.'
    },
    {
      id: 'WH-004',
      shipmentId: 'TAF-2406-881',
      customer: 'Shoprite Holdings',
      warehouseName: 'JHB Main Depot Storage',
      commodity: 'Retail Goods',
      weight: 18.4,
      entryDate: '2026-06-10',
      daysStored: 2,
      reason: 'Driver Mandatory Rest',
      status: 'Released',
      dailyCost: 800,
      notes: 'Clean checkout after 12-hour driver sleep interval completed successfully.'
    },
    {
      id: 'WH-005',
      shipmentId: 'TAF-2406-883',
      customer: 'Foschini Group',
      warehouseName: 'Oshoek Buffer Warehouse',
      commodity: 'Textiles',
      weight: 9.6,
      entryDate: '2026-06-11',
      daysStored: 1,
      reason: 'Border Closed overnight',
      status: 'Released',
      dailyCost: 850,
      notes: 'Gate closed at 22:00. Overnight buffer storage utilized, cleared and left at 06:15.'
    }
  ],

  // Actions implementation
  addWarehouseConsignment: (w) => set((state) => ({ warehouseConsignments: [w, ...state.warehouseConsignments] })),
  updateWarehouseConsignment: (id, updated) => set((state) => ({
    warehouseConsignments: state.warehouseConsignments.map(w => w.id === id ? { ...w, ...updated } : w)
  })),
  deleteWarehouseConsignment: (id) => set((state) => ({
    warehouseConsignments: state.warehouseConsignments.filter(w => w.id !== id)
  })),
  addShipment: (s) => set((state) => ({ shipments: [s, ...state.shipments] })),
  updateShipment: (id, updated) => set((state) => ({
    shipments: state.shipments.map(s => s.id === id ? { ...s, ...updated } : s)
  })),
  deleteShipment: (id) => set((state) => ({
    shipments: state.shipments.filter(s => s.id !== id)
  })),
  deleteShipments: (ids) => set((state) => ({
    shipments: state.shipments.filter(s => !ids.includes(s.id))
  })),

  addVehicle: (v) => set((state) => ({ fleet: [v, ...state.fleet] })),
  updateVehicle: (unit, updated) => set((state) => ({
    fleet: state.fleet.map(v => v.unit === unit ? { ...v, ...updated } : v)
  })),
  deleteVehicle: (unit) => set((state) => ({
    fleet: state.fleet.filter(v => v.unit !== unit)
  })),

  addDriver: (d) => set((state) => ({ drivers: [d, ...state.drivers] })),
  updateDriver: (empId, updated) => set((state) => ({
    drivers: state.drivers.map(d => d.empId === empId ? { ...d, ...updated } : d)
  })),
  deleteDriver: (empId) => set((state) => ({
    drivers: state.drivers.filter(d => d.empId !== empId)
  })),

  addInvoice: (i) => set((state) => ({ invoices: [i, ...state.invoices] })),
  updateInvoice: (no, updated) => set((state) => ({
    invoices: state.invoices.map(i => i.no === no ? { ...i, ...updated } : i)
  })),
  deleteInvoice: (no) => set((state) => ({
    invoices: state.invoices.filter(i => i.no !== no)
  })),

  addFuel: (f) => set((state) => ({ fuel: [f, ...state.fuel] })),
  deleteFuel: (index) => set((state) => ({
    fuel: state.fuel.filter((_, idx) => idx !== index)
  })),

  addWorkOrder: (w) => set((state) => ({ workOrders: [w, ...state.workOrders] })),
  updateWorkOrder: (no, updated) => set((state) => ({
    workOrders: state.workOrders.map(w => w.no === no ? { ...w, ...updated } : w)
  })),
  deleteWorkOrder: (no) => set((state) => ({
    workOrders: state.workOrders.filter(w => w.no !== no)
  })),

  addDocument: (doc) => set((state) => ({ documents: [doc, ...state.documents] })),
  updateDocument: (name, updated) => set((state) => ({
    documents: state.documents.map(d => d.name === name ? { ...d, ...updated } : d)
  })),
  deleteDocument: (name) => set((state) => ({
    documents: state.documents.filter(d => d.name !== name)
  })),

  addPermit: (p) => set((state) => ({ permits: [p, ...state.permits] })),
  updatePermit: (num, updated) => set((state) => ({
    permits: state.permits.map(p => p.num === num ? { ...p, ...updated } : p)
  })),
  deletePermit: (num) => set((state) => ({
    permits: state.permits.filter(p => p.num !== num)
  })),

  addRoute: (r) => set((state) => ({ routes: [r, ...state.routes] })),
  updateRoute: (name, updated) => set((state) => ({
    routes: state.routes.map(r => r.name === name ? { ...r, ...updated } : r)
  })),
  deleteRoute: (name) => set((state) => ({
    routes: state.routes.filter(r => r.name !== name)
  })),

  addCustomer: (c) => set((state) => ({ customers: [c, ...state.customers] })),
  updateCustomer: (name, updated) => set((state) => ({
    customers: state.customers.map(c => c.name === name ? { ...c, ...updated } : c)
  })),
  deleteCustomer: (name) => set((state) => ({
    customers: state.customers.filter(c => c.name !== name)
  })),

  addBorder: (b) => set((state) => ({ borders: [b, ...state.borders] })),
  updateBorder: (name, updated) => set((state) => ({
    borders: state.borders.map(b => b.name === name ? { ...b, ...updated } : b)
  })),
  deleteBorder: (name) => set((state) => ({
    borders: state.borders.filter(b => b.name !== name)
  })),

  addCustoms: (c) => set((state) => ({ customs: [c, ...state.customs] })),
  updateCustoms: (awb, updated) => set((state) => ({
    customs: state.customs.map(c => c.awb === awb ? { ...c, ...updated } : c)
  })),
  deleteCustoms: (awb) => set((state) => ({
    customs: state.customs.filter(c => c.awb !== awb)
  })),

  addActivity: (title, sub, type) => set((state) => ({
    activity: [{ title, sub, type, time: new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }) }, ...state.activity]
  })),
  updateSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),
  toggleNotification: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, unread: !n.unread } : n)
  })),
  clearNotifications: () => set({ notifications: [] }),
}));

export interface Shipment {
  id: string;
  customer: string;
  origin: string;
  destCity: string;
  country: string;
  commodity: string;
  weight: number;
  vehicle: string;
  driver: string;
  border: string;
  status: string;
  eta: string;
  rate: number;
  notes: string;
}

export interface Vehicle {
  unit: string;
  make: string;
  model: string;
  type: string;
  reg: string;
  payload: number;
  odometer: number;
  nextService: number;
  insurance: string;
  crossBorder: string;
  status: string;
}

export interface Driver {
  name: string;
  empId: string;
  licence: string;
  prdp: string;
  prdpExp: string;
  countries: string;
  hours: number;
  trips: number;
  vehicle: string;
  phone: string;
  rating: number;
  status: string;
}

export interface Invoice {
  no: string;
  customer: string;
  amount: number;
  issued: string;
  due: string;
  status: string;
  notes: string;
}

export interface FuelLog {
  date: string;
  vehicle: string;
  driver: string;
  location: string;
  country: string;
  litres: number;
  rate: number;
  total: number;
}

export interface WorkOrder {
  no: string;
  vehicle: string;
  type: string;
  desc: string;
  workshop: string;
  opened: string;
  eta: string;
  cost: number;
  status: string;
  priority: string;
}

export interface CustomsDecl {
  awb: string;
  border: string;
  country: string;
  commodity: string;
  docsOk: number;
  docsTotal: number;
  status: string;
}

export interface AppDocument {
  name: string;
  type: string;
  shipment: string;
  country: string;
  uploaded: string;
  expiry: string;
  status: string;
}

export interface Permit {
  name: string;
  owner: string;
  country: string;
  issued: string;
  expiry: string;
  num: string;
  status: string;
}

export interface Route {
  name: string;
  from: string;
  to: string;
  km: number;
  border: string;
  avgTime: number;
  wait: number;
  activeShips: number;
  status: string;
}

export interface BorderPost {
  name: string;
  countries: string;
  wait: number;
  trucks: number;
  status: string;
}

export interface Customer {
  name: string;
  country: string;
  email: string;
  ships: number;
  revenue: number;
  outstanding: number;
  credit: number;
  tier: string;
  status: string;
}

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  msg: string;
  time: string;
  unread: boolean;
}

export interface ActivityLog {
  type: string;
  title: string;
  sub: string;
  time: string;
}

export interface Settings {
  company: string;
  vat: string;
  sars: string;
  office: string;
  emergency: string;
  dispatcher: string;
  borderAlert: number;
  permitWarn: number;
  serviceWarn: number;
  invoiceWarn: number;
  hoursLimit: number;
}

/**
 * Shared Type Definitions for Mandate402
 */

export type MandateStatus = 'Active' | 'Expiring' | 'Revoked';
export type TransactionStatus = 'Success' | 'Blocked';

export interface Mandate {
  id: string;
  name: string;
  status: MandateStatus;
  agent?: string;
}

export interface Transaction {
  id: string;
  vendor: string;
  amount: string | number;
  status: TransactionStatus;
  timestamp?: string;
}

export interface AgentSpend {
  id: string;
  agentName: string;
  spend: number;
  max: number;
}

export interface KpiData {
  title: string;
  value: string | number;
  delta: number;
  isPositive: boolean;
  subtext: string;
  tooltipText?: string;
}

export interface Activity {
  id: string;
  time: string;
  desc: string;
  amount: string | number;
  status: TransactionStatus;
}

export interface ProposedAction {
  id: string;
  desc: string;
  cost: string | number;
}

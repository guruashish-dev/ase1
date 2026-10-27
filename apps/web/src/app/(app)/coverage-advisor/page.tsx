'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { EmptyState, EmptyStateIcons } from '@/components/ui/EmptyState';

type CoverageStatus = 'covered' | 'partial' | 'gap';
type Priority = 'high' | 'medium' | 'low';

interface Technique {
  id: string;
  name: string;
  tactic: string;
  status: CoverageStatus;
  priority: Priority;
  recommendation: string;
}

const TECHNIQUES: Technique[] = [
  { id: 'T1059', name: 'Command and Scripting Interpreter', tactic: 'Execution', status: 'covered', priority: 'low', recommendation: 'Existing PowerShell & Bash rules active' },
  { id: 'T1059.001', name: 'PowerShell', tactic: 'Execution', status: 'covered', priority: 'low', recommendation: 'ScriptBlock logging rule deployed' },
  { id: 'T1071', name: 'Application Layer Protocol', tactic: 'Command & Control', status: 'partial', priority: 'medium', recommendation: 'Add DNS-over-HTTPS detection rule' },
  { id: 'T1053', name: 'Scheduled Task/Job', tactic: 'Persistence', status: 'gap', priority: 'high', recommendation: 'Deploy schtasks / cron anomaly detection' },
  { id: 'T1078', name: 'Valid Accounts', tactic: 'Initial Access', status: 'partial', priority: 'high', recommendation: 'Correlate impossible-travel with auth logs' },
  { id: 'T1021', name: 'Remote Services', tactic: 'Lateral Movement', status: 'gap', priority: 'high', recommendation: 'Monitor RDP/SSH lateral pivots' },
  { id: 'T1486', name: 'Data Encrypted for Impact', tactic: 'Impact', status: 'covered', priority: 'low', recommendation: 'Ransomware canary files active' },
  { id: 'T1027', name: 'Obfuscated Files or Information', tactic: 'Defense Evasion', status: 'gap', priority: 'high', recommendation: 'Add entropy-based payload analysis' },
  { id: 'T1562', name: 'Impair Defenses', tactic: 'Defense Evasion', status: 'partial', priority: 'medium', recommendation: 'Detect tamper of EDR services' },
  { id: 'T1110', name: 'Brute Force', tactic: 'Credential Access', status: 'covered', priority: 'low', recommendation: 'Rate-limit rules deployed across tenants' },
  { id: 'T1048', name: 'Exfiltration Over Alternative Protocol', tactic: 'Exfiltration', status: 'gap', priority: 'high', recommendation: 'Monitor DNS/ICMP tunneling patterns' },
  { id: 'T1087', name: 'Account Discovery', tactic: 'Discovery', status: 'partial', priority: 'medium', recommendation: 'Alert on bulk LDAP enumeration' },
  { id: 'T1547', name: 'Boot or Logon Autostart Execution', tactic: 'Persistence', status: 'gap', priority: 'medium', recommendation: 'Registry run-key change monitoring' },
  { id: 'T1569', name: 'System Services', tactic: 'Execution', status: 'covered', priority: 'low', recommendation: 'Service creation audit rule active' },
  { id: 'T1190', name: 'Exploit Public-Facing Application', tactic: 'Initial Access', status: 'partial', priority: 'high', recommendation: 'WAF log correlation with CVE feeds' },
];

const STATUS_STYLES: Record<CoverageStatus, { bg: string; text: string; label: string }> = {
  covered: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Covered' },
  partial: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Partial' },
  gap: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Gap' },
};

const PRIORITY_STYLES: Record<Priority, { bg: string; text: string }> = {
  high: { bg: 'bg-red-500/20', text: 'text-red-400' },
  medium: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
  low: { bg: 'bg-green-500/20', text: 'text-green-400' },
};

export const metadata = { title: 'Coverage Gap Advisor' };

export default function CoverageAdvisorPage() {
  const [techniques] = useState(TECHNIQUES);
  const [statusFilter, setStatusFilter] = useState<CoverageStatus | 'all'>('all');

  const filteredTechniques = statusFilter === 'all' ? techniques : techniques.filter((t) => t.status === statusFilter);
  const covered = techniques.filter((t) => t.status === 'covered').length;
  const partial = techniques.filter((t) => t.status === 'partial').length;
  const gaps = techniques.filter((t) => t.status === 'gap').length;
  const coveragePct = Math.round(((covered + partial * 0.5) / techniques.length) * 100);

  const summaryCards = [
    { label: 'Techniques Covered', value: covered },
    { label: 'Coverage %', value: `${coveragePct}%` },
    { label: 'Critical Gaps', value: gaps },
    { label: 'Recommended Detections', value: techniques.filter((t) => t.status !== 'covered').length },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Coverage Gap Advisor</h1>
        <p className="mt-1 text-gray-400">Identify MITRE ATT&amp;CK coverage gaps and get actionable detection recommendations</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {summaryCards.map((c) => (
          <div key={c.label} className="rounded-xl border border-gray-800/60 bg-gray-900/40 p-4">
            <p className="text-xs uppercase tracking-wider text-gray-400">{c.label}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-800/60 bg-gray-900/40">
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-800/60 px-5 py-4">
          <h2 className="min-w-0 flex-1 text-lg font-semibold text-white">Gap Analysis</h2>
          <div className="flex gap-2">
            {(['all', 'gap', 'partial', 'covered'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={clsx(
                  'rounded-lg border px-3 py-1 text-xs transition-colors',
                  statusFilter === f ? 'border-blue-600/30 bg-blue-600/15 text-blue-300' : 'border-gray-800 text-gray-400 hover:border-gray-700',
                )}
              >
                {f === 'all' ? 'All' : STATUS_STYLES[f as CoverageStatus].label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800/60 text-left text-gray-400">
                <th className="px-5 py-3 font-medium">Technique</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Tactic</th>
                <th className="px-5 py-3 font-medium text-center">Coverage</th>
                <th className="px-5 py-3 font-medium text-center">Priority</th>
                <th className="px-5 py-3 font-medium">Recommendation</th>
                <th className="px-5 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTechniques.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-0">
                    <EmptyState
                      icon={EmptyStateIcons.shield}
                      title="No techniques match this filter"
                      description="Try selecting a different coverage status or view all techniques."
                      action={
                        <button
                          type="button"
                          onClick={() => setStatusFilter('all')}
                          className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-200 transition-colors hover:bg-gray-700"
                        >
                          Show all techniques
                        </button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                filteredTechniques.map((t) => {
                  const st = STATUS_STYLES[t.status];
                  const pr = PRIORITY_STYLES[t.priority];
                  return (
                    <tr key={t.id} className="border-b border-gray-800/40 transition-colors hover:bg-gray-800/30">
                      <td className="px-5 py-3 font-mono text-xs text-blue-400">{t.id}</td>
                      <td className="px-5 py-3 text-white">{t.name}</td>
                      <td className="px-5 py-3 text-gray-300">{t.tactic}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={clsx('inline-block rounded-full px-2.5 py-0.5 text-xs font-medium', st.bg, st.text)}>{st.label}</span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={clsx('inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', pr.bg, pr.text)}>{t.priority}</span>
                      </td>
                      <td className="max-w-xs px-5 py-3 text-gray-400 truncate">{t.recommendation}</td>
                      <td className="px-5 py-3 text-center">
                        {t.status !== 'covered' && (
                          <button
                            onClick={() => toast.success(`Detection rule draft created for ${t.id}`)}
                            className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs text-white transition-colors hover:bg-blue-500 whitespace-nowrap"
                          >
                            Generate Detection
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

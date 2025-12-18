import type { AgentDetails } from '../types/agentDetails.types';

export const mockAgentDatabase: AgentDetails[] = [
  // Agent 1: Calling Settings Transfer (Primary - High-fidelity)
  {
    id: 'ch-1',
    name: 'Calling Settings Transfer',
    version: '1.2.0',
    status: 'active',
    category: 'Automation',
    complexity: 'Low Risk',
    description: 'Seamlessly transfers Webex Calling configurations from a users to another. Automates the migration of extensions, call handling rules, and device associations to ensure business continuity.',
    expectedOutcome: 'Target user will inherit all extensions and routing rules. Original user profile remains unchanged.',
    whenToUse: 'When migrating Webex Calling settings from one user to another (e.g., replacement, role change, or shared account cleanup).',
    riskLevel: 'safe',
    documentationUrl: 'https://developer.webex.com/docs/api/calling',
    owner: {
      name: 'Control Hub',
    //   team: 'Control Hub',
      avatarInitials: 'CH'
    },
    lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    inputs: [
      {
        id: 'input-1',
        label: 'Source User',
        type: 'Email',
        required: true,
        description: 'Email address of the user whose settings will be copied'
      },
      {
        id: 'input-2',
        label: 'Target User',
        type: 'Email',
        required: true,
        description: 'Email address of the user who will receive the settings'
      },
      {
        id: 'input-3',
        label: 'Transfer Voicemail PIN',
        type: 'Boolean',
        required: false,
        description: 'Whether to reset and transfer voicemail PIN'
      }
    ],
    workflow: [
      {
        id: 'step-1',
        title: 'Fetch Source Profile',
        description: 'Retrieves Directory Numbers (DN), Caller ID, and Device associations.',
        icon: 'download-regular'
      },
      {
        id: 'step-2',
        title: 'Export Call Handling Rules',
        description: 'Extracts Call Forwarding, Simultaneous Ring, and Do Not Disturb settings.',
        icon: 'settings-regular'
      },
      {
        id: 'step-3',
        title: 'Validate Target License',
        description: 'Checks if Target User has \'Webex Calling Professional\' license assigned.',
        icon: 'check-circle-regular',
        knowledgeDocs: ['License_Compatibility_Matrix.pdf']
      },
      {
        id: 'step-4',
        title: 'Apply Configuration',
        description: 'Writes settings to target profile and resets Voicemail PIN.',
        icon: 'document-create-regular'
      }
    ],
    hasKnowledge: true,
    knowledgeSources: ['License_Compatibility_Matrix.pdf'],
    metrics: {
      successRate: 98,
      runsLast30Days: 47,
      uniqueAdmins: 12,
      usersMigrated: 89,
      guardrailBlocks: 3,
      incidentsReported: 0,
      averageDurationSeconds: 120,
      totalRuns: 47,
      avgDuration: 120, // legacy
      lastRunTime: new Date(Date.now() - 45 * 60 * 1000).toISOString() // 45 min ago
    },
    guardrails: [
      {
        id: 'guard-1',
        label: 'Requires Admin Approval',
        iconType: 'shield',
        enabled: true
      },
      {
        id: 'guard-2',
        label: 'Scope: Write Access to Users',
        iconType: 'lock',
        enabled: true
      },
      {
        id: 'guard-3',
        label: 'Audit Log Retention: 90 Days',
        iconType: 'clock',
        enabled: true
      }
    ],
    recentRuns: [
      {
        id: 'run-1',
        user: 'Amanda Lee',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        status: 'success',
        duration: 1.9
      },
      {
        id: 'run-2',
        user: 'David Park',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        status: 'success',
        duration: 1.7
      },
      {
        id: 'run-3',
        user: 'Rachel Smith',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        status: 'success',
        duration: 1.8
      },
      {
        id: 'run-4',
        user: 'Mike Chen',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        status: 'success',
        duration: 2.1
      },
      {
        id: 'run-5',
        user: 'Sarah Johnson',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'success',
        duration: 1.6
      }
    ]
  },

  // Agent 2: Bulk Device Onboarding (Device Management type)
  {
    id: 'ch-2',
    name: 'Bulk device onboarding',
    version: '2.0.1',
    status: 'active',
    category: 'Device management',
    complexity: 'High Impact',
    description: 'Adds and configures large batches of Webex devices in one run, assigning them to workspaces, locations, and default policies from a CSV or inventory source.',
    expectedOutcome: 'All devices are registered, assigned to locations, and configured with baseline policies.',
    riskLevel: 'safe',
    documentationUrl: 'https://example.com/device-onboarding-docs',
    owner: {
      name: 'Device Ops',
      team: 'IT Operations',
      avatarInitials: 'DO'
    },
    lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    inputs: [
      {
        id: 'input-1',
        label: 'CSV File Upload',
        type: 'String',
        required: true,
        description: 'CSV file with device MAC addresses and location mappings'
      },
      {
        id: 'input-2',
        label: 'Default Policy Template',
        type: 'String',
        required: false,
        description: 'Name of the policy template to apply to all devices'
      }
    ],
    workflow: [
      {
        id: 'step-1',
        title: 'Parse CSV File',
        description: 'Extract device identifiers and workspace assignments.',
        icon: 'document-regular'
      },
      {
        id: 'step-2',
        title: 'Validate Devices',
        description: 'Check if devices are compatible and not already registered.',
        icon: 'check-circle-regular'
      },
      {
        id: 'step-3',
        title: 'Register Devices',
        description: 'Add devices to Control Hub and assign to workspaces.',
        icon: 'device-connection-regular',
        knowledgeDocs: ['Device_Compatibility_Guide.pdf']
      },
      {
        id: 'step-4',
        title: 'Apply Policies',
        description: 'Configure baseline settings and policies for each device.',
        icon: 'settings-regular'
      }
    ],
    hasKnowledge: true,
    knowledgeSources: ['Device_Compatibility_Guide.pdf'],
    metrics: {
      successRate: 94,
      runsLast30Days: 156,
      uniqueAdmins: 8,
      usersMigrated: 0, // Not applicable for this agent type
      guardrailBlocks: 5,
      incidentsReported: 0,
      averageDurationSeconds: 420, // 7 minutes
      totalRuns: 156,
      avgDuration: 7, // legacy
      lastRunTime: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 min ago
    },
    guardrails: [
      {
        id: 'guard-1',
        label: 'PII Detection Enabled',
        iconType: 'shield',
        enabled: true
      },
      {
        id: 'guard-2',
        label: 'Scope: Read-Only',
        iconType: 'lock',
        enabled: true
      },
      {
        id: 'guard-3',
        label: 'Data Retention: 30 days',
        iconType: 'clock',
        enabled: true
      }
    ],
    recentRuns: [
      {
        id: 'run-1',
        user: 'Emily Rodriguez',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'success',
        duration: 3.4
      },
      {
        id: 'run-2',
        user: 'James Wilson',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'success',
        duration: 2.9
      },
      {
        id: 'run-3',
        user: 'Lisa Thompson',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        status: 'failed',
        duration: 0.8
      },
      {
        id: 'run-4',
        user: 'Alex Kumar',
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        status: 'success',
        duration: 3.1
      },
      {
        id: 'run-5',
        user: 'Maria Garcia',
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        status: 'success',
        duration: 3.3
      }
    ]
  },

  // Agent 3: Security Compliance Checker (Placeholder - Monitoring type)
  {
    id: 'ch-3',
    name: 'Security Compliance Checker',
    version: '1.5.2',
    status: 'active',
    category: 'Security',
    complexity: 'High Impact',
    description: 'Continuously monitors workspace security posture and compliance with organizational policies. Scans for unauthorized access, inactive users, and policy violations.',
    expectedOutcome: 'Generates compliance report highlighting violations and recommended remediations.',
    riskLevel: 'safe',
    documentationUrl: 'https://example.com/security-compliance-docs',
    owner: {
      name: 'Security Team',
      team: 'InfoSec',
      avatarInitials: 'ST'
    },
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    inputs: [
      {
        id: 'input-1',
        label: 'Workspace ID',
        type: 'String',
        required: true,
        description: 'Target workspace to scan'
      },
      {
        id: 'input-2',
        label: 'Report Format',
        type: 'String',
        required: false,
        description: 'Output format (PDF or JSON)'
      }
    ],
    workflow: [
      {
        id: 'step-1',
        title: 'Fetch User List',
        description: 'Retrieve all users and their access permissions.',
        icon: 'people-regular'
      },
      {
        id: 'step-2',
        title: 'Check Inactive Users',
        description: 'Identify users who have not logged in for 90+ days.',
        icon: 'clock-regular'
      },
      {
        id: 'step-3',
        title: 'Scan Policy Violations',
        description: 'Check for MFA disabled, weak passwords, and unauthorized apps.',
        icon: 'shield-regular'
      },
      {
        id: 'step-4',
        title: 'Generate Report',
        description: 'Create compliance report and send to security team.',
        icon: 'document-create-regular'
      }
    ],
    hasKnowledge: false,
    knowledgeSources: [],
    metrics: {
      successRate: 100,
      runsLast30Days: 324,
      uniqueAdmins: 3,
      usersMigrated: 0, // Not applicable for this agent type
      guardrailBlocks: 0,
      incidentsReported: 0,
      averageDurationSeconds: 270, // 4.5 minutes
      totalRuns: 324,
      avgDuration: 4.5, // legacy
      lastRunTime: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1 hour ago
    },
    guardrails: [
      {
        id: 'guard-1',
        label: 'Admin Access Required',
        iconType: 'shield',
        enabled: true
      },
      {
        id: 'guard-2',
        label: 'Scope: Read-Only',
        iconType: 'lock',
        enabled: true
      },
      {
        id: 'guard-3',
        label: 'Encrypted Data Transfer',
        iconType: 'lock',
        enabled: true
      }
    ],
    recentRuns: [
      {
        id: 'run-1',
        user: 'Security Bot',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        status: 'success',
        duration: 4.2
      },
      {
        id: 'run-2',
        user: 'Security Bot',
        timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        status: 'success',
        duration: 4.6
      },
      {
        id: 'run-3',
        user: 'Admin User',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        status: 'success',
        duration: 4.8
      },
      {
        id: 'run-4',
        user: 'Security Bot',
        timestamp: new Date(Date.now() - 73 * 60 * 60 * 1000).toISOString(),
        status: 'success',
        duration: 4.3
      },
      {
        id: 'run-5',
        user: 'Security Bot',
        timestamp: new Date(Date.now() - 97 * 60 * 60 * 1000).toISOString(),
        status: 'success',
        duration: 4.7
      }
    ]
  }
];


export type LeadStep = 'name' | 'email' | 'company' | 'country' | 'service_or_extension' | 'requirement_summary' | 'complete';
export type SupportStep = 'extension' | 'issue' | 'module' | 'error_message' | 'follow_up_email' | 'complete';
export type Intent = 'general' | 'lead_capture' | 'support' | 'extension_recommendation';

export interface LeadData {
  name: string;
  email: string;
  company: string;
  country: string;
  service_or_extension: string;
  requirement_summary: string;
}

export interface SupportData {
  extension: string;
  issue: string;
  module: string;
  error_message: string;
  follow_up_email: string;
}

export interface ConversationContext {
  intent: Intent;
  lead_step: LeadStep | 'not_started';
  support_step: SupportStep | 'not_started';
  leadData: Partial<LeadData>;
  supportData: Partial<SupportData>;
}

export function detectIntent(message: string): Intent {
  const lower = message.toLowerCase();
  const leadTriggers = [
    'pricing', 'cost', 'price', 'demo', 'book a call', 'consultation',
    'i need this', 'i want to buy', 'contact me', 'hire you', 'quote',
    'how much', 'get started', 'request a demo', 'book consultation'
  ];

  const supportTriggers = [
    'error', 'not working', 'issue', 'bug', 'help with', 'setup', 'install',
    'troubleshoot', 'broken', 'fix', 'support', 'problem', 'cannot connect'
  ];

  const extensionTriggers = [
    'workdrive', 'sharepoint', 'google drive', 'onedrive', 'dropbox',
    'file management', 'address toolkit', 'easy email', 'extension', 'which extension'
  ];

  if (leadTriggers.some(t => lower.includes(t))) return 'lead_capture';
  if (supportTriggers.some(t => lower.includes(t))) return 'support';
  if (extensionTriggers.some(t => lower.includes(t))) return 'extension_recommendation';
  return 'general';
}

function isValidEmail(text: string): boolean {
  return /^[\w.-]+@[\w.-]+\.\w+$/.test(text.trim());
}

export function advanceLeadStep(currentStep: LeadStep | 'not_started', input: string, leadData: Partial<LeadData>) {
  if (currentStep === 'not_started' || currentStep === 'complete') {
    return { step: currentStep as LeadStep, data: leadData };
  }
  
  const data = { ...leadData };
  let nextStep: LeadStep = currentStep;

  switch (currentStep) {
    case 'name':
      data.name = input.trim();
      nextStep = 'email';
      break;
    case 'email':
      if (!isValidEmail(input)) {
        nextStep = 'email';
      } else {
        data.email = input.trim();
        nextStep = 'company';
      }
      break;
    case 'company':
      data.company = input.trim();
      nextStep = 'country';
      break;
    case 'country':
      data.country = input.trim();
      nextStep = 'service_or_extension';
      break;
    case 'service_or_extension':
      data.service_or_extension = input.trim();
      nextStep = 'requirement_summary';
      break;
    case 'requirement_summary':
      data.requirement_summary = input.trim();
      nextStep = 'complete';
      break;
  }

  return { step: nextStep, data };
}

export function advanceSupportStep(currentStep: SupportStep | 'not_started', input: string, supportData: Partial<SupportData>) {
  if (currentStep === 'not_started' || currentStep === 'complete') {
    return { step: currentStep as SupportStep, data: supportData };
  }
  
  const data = { ...supportData };
  let nextStep: SupportStep = currentStep;

  switch (currentStep) {
    case 'extension':
      data.extension = input.trim();
      nextStep = 'issue';
      break;
    case 'issue':
      data.issue = input.trim();
      nextStep = 'module';
      break;
    case 'module':
      data.module = input.trim();
      nextStep = 'error_message';
      break;
    case 'error_message':
      data.error_message = input.trim();
      nextStep = 'follow_up_email';
      break;
    case 'follow_up_email':
      if (!isValidEmail(input)) {
        nextStep = 'follow_up_email';
      } else {
        data.follow_up_email = input.trim();
        nextStep = 'complete';
      }
      break;
  }
  return { step: nextStep, data };
}

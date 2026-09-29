export const company = {
  name: import.meta.env.VITE_COMPANY_NAME || '2ITeam',
  tagline: 'Удалённые ИТ-услуги для бизнеса и частных лиц',
  phone: import.meta.env.VITE_CONTACT_PHONE || '+7 (915) 180-57-49',
  email: import.meta.env.VITE_CONTACT_EMAIL || 'support@2iteam.ru',
  max: import.meta.env.VITE_CONTACT_MAX || '2iteam',
  maxTitle: import.meta.env.VITE_CONTACT_MAX_TITLE || 'Написать в MAX',
}

export const maxUrl =
  import.meta.env.VITE_CONTACT_MAX_URL ||
  'https://max.ru/u/f9LHodD0cOJg-Zm1q3iLa7uTmfUgKta-NZ5rSLoaWnS26314NxPXZzCpc7g'

export const formConfig = {
  endpoint:
    import.meta.env.VITE_FORM_ENDPOINT || 'https://api.web3forms.com/submit',
  web3formsKey:
    import.meta.env.VITE_WEB3FORMS_KEY || 'e4050a85-4301-45d4-9cba-e0a87dec9b05',
  maxToken: import.meta.env.VITE_MAX_BOT_TOKEN || '',
  maxChatId: import.meta.env.VITE_MAX_CHAT_ID || '',
  maxUserId: import.meta.env.VITE_MAX_USER_ID || '',
}

// i18n messages - Hebrew first, English for future
export type Locale = 'he' | 'en';

export const messages: Record<Locale, Record<string, string>> = {
  he: {
    // Common
    'common.loading': 'טוען...',
    'common.error': 'שגיאה',
    'common.save': 'שמור',
    'common.cancel': 'ביטול',
    'common.close': 'סגור',
    'common.submit': 'שלח',
    'common.back': 'חזרה',

    // Navigation
    'nav.home': 'בית',
    'nav.shows': 'שידורים',
    'nav.login': 'התחברות',
    'nav.logout': 'התנתקות',

    // Show status
    'show.status.scheduled': 'מתוכנן',
    'show.status.live': 'בשידור',
    'show.status.ended': 'הסתיים',
    'show.live_badge': 'שידור חי',
    'show.viewers': 'צופים',
    'show.starts_in': 'מתחיל בעוד',

    // Viewer
    'viewer.chat.placeholder': 'כתוב הודעה...',
    'viewer.chat.send': 'שלח',
    'viewer.cart.title': 'עגלת קניות',
    'viewer.cart.empty': 'העגלה ריקה',
    'viewer.cart.checkout': 'לתשלום',
    'viewer.cart.total': 'סה״כ',
    'viewer.cart.remove': 'הסר',
    'viewer.product.add_to_cart': 'הוסף לעגלה',
    'viewer.product.shop_all': 'כל המוצרים',
    'viewer.countdown.days': 'ימים',
    'viewer.countdown.hours': 'שעות',
    'viewer.countdown.minutes': 'דקות',
    'viewer.countdown.seconds': 'שניות',

    // Lead capture
    'lead.title': 'הצטרף לשידור',
    'lead.name': 'שם',
    'lead.phone': 'טלפון',
    'lead.email': 'אימייל',
    'lead.consent': 'אני מסכים לקבל עדכונים על שידורים חדשים',
    'lead.notify_me': 'עדכנו אותי',
    'lead.required': 'שדה חובה',

    // Host panel
    'host.title': 'לוח בקרה',
    'host.create_show': 'צור שידור חדש',
    'host.edit_show': 'ערוך שידור',
    'host.show_title': 'כותרת השידור',
    'host.scheduled_at': 'תאריך ושעה',
    'host.go_live': 'התחל שידור',
    'host.end_show': 'סיים שידור',
    'host.stream_info': 'פרטי חיבור',
    'host.rtmp_url': 'כתובת RTMP',
    'host.stream_key': 'מפתח שידור',
    'host.copy': 'העתק',
    'host.copied': 'הועתק!',
    'host.products': 'מוצרים',
    'host.add_product': 'הוסף מוצר',
    'host.search_products': 'חפש מוצרים...',
    'host.push_product': 'הצג על המסך',
    'host.hide_product': 'הסתר מהמסך',
    'host.chat_moderation': 'ניהול צ׳אט',
    'host.hide_message': 'הסתר הודעה',
    'host.stream_status': 'סטטוס שידור',
    'host.stream_idle': 'ממתין לחיבור',
    'host.stream_active': 'משדר',
    'host.stream_disconnected': 'מנותק',

    // Auth
    'auth.login': 'התחברות',
    'auth.email': 'אימייל',
    'auth.send_magic_link': 'שלח קישור התחברות',
    'auth.check_email': 'בדוק את האימייל שלך',
    'auth.magic_link_sent': 'שלחנו לך קישור להתחברות',

    // Errors
    'error.general': 'משהו השתבש, נסה שוב',
    'error.not_found': 'לא נמצא',
    'error.unauthorized': 'אין הרשאה',
  },
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.submit': 'Submit',
    'common.back': 'Back',

    // Navigation
    'nav.home': 'Home',
    'nav.shows': 'Shows',
    'nav.login': 'Login',
    'nav.logout': 'Logout',

    // Show status
    'show.status.scheduled': 'Scheduled',
    'show.status.live': 'Live',
    'show.status.ended': 'Ended',
    'show.live_badge': 'LIVE',
    'show.viewers': 'viewers',
    'show.starts_in': 'Starts in',

    // Viewer
    'viewer.chat.placeholder': 'Write a message...',
    'viewer.chat.send': 'Send',
    'viewer.cart.title': 'Shopping Cart',
    'viewer.cart.empty': 'Your cart is empty',
    'viewer.cart.checkout': 'Checkout',
    'viewer.cart.total': 'Total',
    'viewer.cart.remove': 'Remove',
    'viewer.product.add_to_cart': 'Add to Cart',
    'viewer.product.shop_all': 'Shop All',
    'viewer.countdown.days': 'days',
    'viewer.countdown.hours': 'hours',
    'viewer.countdown.minutes': 'minutes',
    'viewer.countdown.seconds': 'seconds',

    // Lead capture
    'lead.title': 'Join the Show',
    'lead.name': 'Name',
    'lead.phone': 'Phone',
    'lead.email': 'Email',
    'lead.consent': 'I agree to receive updates about new shows',
    'lead.notify_me': 'Notify Me',
    'lead.required': 'Required',

    // Host panel
    'host.title': 'Control Panel',
    'host.create_show': 'Create New Show',
    'host.edit_show': 'Edit Show',
    'host.show_title': 'Show Title',
    'host.scheduled_at': 'Date & Time',
    'host.go_live': 'Go Live',
    'host.end_show': 'End Show',
    'host.stream_info': 'Stream Info',
    'host.rtmp_url': 'RTMP URL',
    'host.stream_key': 'Stream Key',
    'host.copy': 'Copy',
    'host.copied': 'Copied!',
    'host.products': 'Products',
    'host.add_product': 'Add Product',
    'host.search_products': 'Search products...',
    'host.push_product': 'Push to Screen',
    'host.hide_product': 'Hide from Screen',
    'host.chat_moderation': 'Chat Moderation',
    'host.hide_message': 'Hide Message',
    'host.stream_status': 'Stream Status',
    'host.stream_idle': 'Waiting for connection',
    'host.stream_active': 'Broadcasting',
    'host.stream_disconnected': 'Disconnected',

    // Auth
    'auth.login': 'Login',
    'auth.email': 'Email',
    'auth.send_magic_link': 'Send Magic Link',
    'auth.check_email': 'Check your email',
    'auth.magic_link_sent': 'We sent you a login link',

    // Errors
    'error.general': 'Something went wrong, please try again',
    'error.not_found': 'Not found',
    'error.unauthorized': 'Unauthorized',
  },
};

// Default locale
export const defaultLocale: Locale = 'en';

// Get translation helper
export function t(locale: Locale, key: string): string {
  return messages[locale][key] || messages[defaultLocale][key] || key;
}

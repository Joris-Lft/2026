export const APP_NAME = "Chatonnerie";

export function formatPageTitle(pageTitle?: string): string {
  return pageTitle ? `${pageTitle} — ${APP_NAME}` : APP_NAME;
}

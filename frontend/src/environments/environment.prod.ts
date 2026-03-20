// eslint-disable-next-line no-restricted-imports
import packageJson from '../../package.json';

export const environment = {
  production: true,
  appName: 'News -.',
  appVersion: packageJson.version,
  appDescription: 'Nền tảng luyện nói tiếng Anh giao tiếp phản xạ số 1 Việt Nam',
  author: 'Giao Tiếp Online',
  authorEmail: 'contact@hoctienganhgiaotieponline.com',
  authorWebsite: 'https://hoctienganhgiaotieponline.com',
  defaultLanguage: 'vi', // Chuyển sang tiếng Việt
  darkModeAsDefault: false,
  checkForUpdatesInterval: 60,
  baseUrl: 'http://localhost:4200',
  apiServeUrl: 'http://localhost:8080' // Giữ nguyên theo yêu cầu của bạn
};

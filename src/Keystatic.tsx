import { Keystatic } from '@keystatic/core/ui';
import config from '../keystatic.config';

export default function KeystaticPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Keystatic config={config as any} />;
}

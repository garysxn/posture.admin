import { DisplayNamePipe } from './display-name.pipe';
import { AgePipe } from './age.pipe';
import { KeysPipe, LengthPipe } from './json.pipe';

export const SHARED_DECLARATIONS: any[] = [
  DisplayNamePipe,
  AgePipe,
  KeysPipe,
  LengthPipe
];
